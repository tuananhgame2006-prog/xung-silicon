import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import xss from 'xss';
import nodemailer from 'nodemailer';
import { query, run } from './server/web_db.js';

dotenv.config({ path: '.env.local' }); // Load .env.local for ADMIN_EMAIL, ADMIN_PASSWORD, JWT_SECRET

const app = express();
app.set('trust proxy', 1); // Railway runs behind a reverse proxy
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

const PORT = process.env.PORT || 3000;

const JWT_SECRET = process.env.JWT_SECRET && process.env.JWT_SECRET.trim() !== '' 
  ? process.env.JWT_SECRET 
  : 'nhipdap_secret_key_default_123!@#';

if (!process.env.JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET is not defined in environment. Using default fallback.");
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'tuananhgame2006@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

// -------------------------------------------------------------
// DEFENSE-GRADE RATE LIMITING
// -------------------------------------------------------------
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per window
  message: { error: 'Too many login attempts. IP locked out for 15 minutes.' }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests from this IP. Please try again later.' }
});

app.use('/api/', apiLimiter);

// -------------------------------------------------------------
// MAILER CONFIGURATION (Dual-mode: Resend HTTP API + SMTP fallback)
// Railway blocks SMTP ports, so we use Resend.com HTTP API in production.
// -------------------------------------------------------------
const SMTP_USER = process.env.SMTP_USER || 'tuananhgame2006@gmail.com';
const SMTP_PASS = process.env.SMTP_PASS || 'cjlr ukgg nslo xfmr';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || '';

// SMTP transporter (for local dev only)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
  connectionTimeout: 10000,
  socketTimeout: 15000,
});

async function sendOTPEmail(to: string, code: string) {
  const subject = 'Mã xác nhận OTP - Nhịp đập Công Nghệ';
  const text = `Mã xác nhận của bạn là: ${code}. Mã có hiệu lực trong 5 phút. Vui lòng không chia sẻ mã này.`;

  // Priority 1: Google Apps Script (100% Free, bypasses SMTP blocks, uses your Gmail)
  if (GOOGLE_SCRIPT_URL) {
    console.log(`[OTP/GAS] Sending code ${code} to ${to}...`);
    try {
      const resp = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ to, subject, body: text }),
      });
      if (resp.ok) {
        console.log(`[OTP/GAS] ✅ Email sent successfully via Google Script to ${to}`);
        return;
      }
    } catch (e: any) {
      console.error(`[OTP/GAS] ❌ Failed to send via Google Script:`, e.message);
    }
  }

  // Priority 2: Resend HTTP API (works on Railway, requires domain for non-owner emails)
  if (RESEND_API_KEY) {
    console.log(`[OTP/Resend] Sending code ${code} to ${to}...`);
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Nhịp đập Công Nghệ <onboarding@resend.dev>',
        to: [to],
        subject,
        text,
      }),
    });
    if (resp.ok) {
      console.log(`[OTP/Resend] ✅ Email sent to ${to}`);
    } else {
      const err = await resp.text();
      console.error(`[OTP/Resend] ❌ Failed:`, err);
    }
    return;
  }

  // Priority 3: SMTP (works locally, blocked on Railway)
  console.log(`[OTP/SMTP] Sending code ${code} to ${to}...`);
  const info = await transporter.sendMail({
    from: `"Nhịp đập Công Nghệ" <${SMTP_USER}>`,
    to,
    subject,
    text,
  });
  console.log(`[OTP/SMTP] ✅ Email sent to ${to}:`, info.response);
}

if (GOOGLE_SCRIPT_URL) {
  console.log('[MAIL] ✅ Using Google Apps Script for emails (100% Free)');
} else if (RESEND_API_KEY) {
  console.log('[MAIL] ✅ Using Resend HTTP API for emails');
} else {
  console.log('[MAIL] ⚠️ RESEND_API_KEY not set, falling back to SMTP (may fail on Railway)');
  transporter.verify()
    .then(() => console.log('[SMTP] ✅ SMTP connection OK'))
    .catch(err => console.error('[SMTP] ❌ SMTP FAILED:', err.message));
}

app.post('/api/request-otp', apiLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) return res.status(400).json({ error: 'Email không hợp lệ.' });
  const cleanEmail = xss(email);
  const code = Math.floor(1000 + Math.random() * 9000).toString(); // 4 digits
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins
  try {
    await run('INSERT INTO otps (email, code, expiresAt) VALUES (?, ?, ?) ON CONFLICT(email) DO UPDATE SET code=excluded.code, expiresAt=excluded.expiresAt', [cleanEmail, code, expiresAt]);
    // Respond IMMEDIATELY so the user doesn't wait
    res.json({ success: true, message: 'OTP sent' });
    // Send email in background (fire-and-forget)
    sendOTPEmail(cleanEmail, code).catch(err => {
      console.error(`[OTP] ❌ Email send error:`, err.message || err);
    });
  } catch (err) {
    res.status(500).json({ error: 'Không thể tạo OTP.' });
  }
});

// MIDDLEWARE: JWT AUTHENTICATION
// -------------------------------------------------------------
const verifyToken = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// -------------------------------------------------------------
// API: AUTHENTICATION
// -------------------------------------------------------------
app.post('/api/login', loginLimiter, (req, res) => {
  const { email, password } = req.body;
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '8h' });
    return res.json({ role: 'admin', token });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

app.get('/api/admin/verify', verifyToken, (req, res) => {
  res.json({ valid: true });
});

// -------------------------------------------------------------
// API: SUBMISSIONS & ADMIN
// -------------------------------------------------------------
app.post('/api/submit', async (req, res) => {
  const { title, content, category, authorEmail } = req.body;
  const id = `article-${Date.now()}`;
  
  // Sanitize inputs
  const cleanTitle = xss(title);
  const cleanContent = xss(content);
  const cleanCategory = xss(category);
  const cleanAuthorEmail = xss(authorEmail);

  try {
    await run(
      'INSERT INTO pending_articles (id, title, excerpt, content, category, author, publishDate) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, cleanTitle, cleanTitle.substring(0, 100) + '...', cleanContent, cleanCategory, cleanAuthorEmail, new Date().toISOString()]
    );
    res.json({ message: 'Submission successful, pending admin review.' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/admin/pending-articles', verifyToken, async (req, res) => {
  try {
    const articles = await query('SELECT * FROM pending_articles WHERE status = "pending"');
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/admin/approve/:id', verifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    await run('UPDATE pending_articles SET status = "approved" WHERE id = ?', [id]);
    
    // Email logic has been removed to a separate SEO project

    res.json({ message: 'Article approved and notifications dispatched.' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/admin/reject/:id', verifyToken, async (req, res) => {
  try {
    await run('UPDATE pending_articles SET status = "rejected" WHERE id = ?', [req.params.id]);
    res.json({ message: 'Article rejected.' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/api/admin/article/:id', verifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    await run('DELETE FROM pending_articles WHERE id = ?', [id]);
    await run('INSERT OR IGNORE INTO hidden_articles (id) VALUES (?)', [id]);
    res.json({ message: 'Article deleted permanently.' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/hidden-articles', async (req, res) => {
  try {
    const rows = await query('SELECT id FROM hidden_articles');
    res.json(rows.map(r => r.id));
  } catch {
    res.json([]);
  }
});

// -------------------------------------------------------------
// API: COMMUNITY
// -------------------------------------------------------------
app.post('/api/community/post', async (req, res) => {
  const { author, authorRole, content, category, image } = req.body;
  const id = `post-${Date.now()}`;
  
  // Sanitize inputs
  const cleanAuthor = xss(author);
  const cleanAuthorRole = xss(authorRole);
  const cleanContent = xss(content);
  const cleanCategory = xss(category);
  const cleanImage = image ? xss(image) : null;

  try {
    await run(
      'INSERT INTO community_posts (id, author, authorRole, time, content, category, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, cleanAuthor, cleanAuthorRole, 'Vừa xong', cleanContent, cleanCategory, cleanImage]
    );
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/community/posts', async (req, res) => {
  try {
    const posts = await query('SELECT * FROM community_posts ORDER BY id DESC');
    const comments = await query('SELECT * FROM community_comments');
    
    const formattedPosts = posts.map(post => {
      const postComments = comments
        .filter(c => c.postId === post.id)
        .map(c => ({
          id: c.id,
          author: c.author,
          time: c.time,
          content: c.content,
          likes: 0,
          isLiked: false,
          replies: []
        }));
      return { ...post, comments: postComments };
    });
    
    res.json(formattedPosts);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/api/community/post/:id', verifyToken, async (req, res) => {
  try {
    await run('DELETE FROM community_comments WHERE postId = ?', [req.params.id]);
    await run('DELETE FROM community_posts WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Đã xóa bài đăng.' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/community/comment', async (req, res) => {
  const { postId, author, content } = req.body;
  const id = `comment-${Date.now()}`;
  try {
    await run(
      'INSERT INTO community_comments (id, postId, author, time, content) VALUES (?, ?, ?, ?, ?)',
      [id, postId, xss(author), 'Vừa xong', xss(content)]
    );
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/api/community/comment/:id', verifyToken, async (req, res) => {
  try {
    await run('DELETE FROM community_comments WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/register', apiLimiter, async (req, res) => {
  const { email, code } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Email không hợp lệ.' });
  }
  const cleanEmail = xss(email);
  try {
    if (!code) {
      return res.status(400).json({ error: 'Thiếu mã xác nhận.' });
    }
    const otps = await query('SELECT * FROM otps WHERE email = ?', [cleanEmail]);
    if (otps.length === 0 || otps[0].code !== code || otps[0].expiresAt < Date.now()) {
      return res.status(400).json({ error: 'Mã xác nhận không đúng hoặc đã hết hạn.' });
    }
    // Use INSERT OR IGNORE so if they are already a subscriber, they can still verify their OTP for community access
    await run('INSERT OR IGNORE INTO subscribers (email, subscribedAt) VALUES (?, ?)', [cleanEmail, new Date().toISOString()]);
    await run('DELETE FROM otps WHERE email = ?', [cleanEmail]);
    res.json({ success: true, message: 'Đăng ký nhận bản tin thành công!' });
  } catch (err: any) {
    res.status(500).json({ error: 'Lỗi cơ sở dữ liệu.' });
  }
});

app.post('/api/verify-registration', apiLimiter, async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ error: 'Thiếu thông tin.' });
  try {
    const otps = await query('SELECT * FROM otps WHERE email = ?', [xss(email)]);
    if (otps.length === 0 || otps[0].code !== code || otps[0].expiresAt < Date.now()) {
      return res.status(400).json({ error: 'Mã xác nhận không đúng hoặc đã hết hạn.' });
    }
    await run('DELETE FROM otps WHERE email = ?', [xss(email)]);
    res.json({ success: true, message: 'Xác thực thành công.' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi cơ sở dữ liệu.' });
  }
});

app.get('/api/news', (req, res) => {
  // Empty mock for fetching latest news directly from DB (if wanted)
  res.json([]);
});

// -------------------------------------------------------------
// IMAGE SERVING ENDPOINTS (For locally generated covers)
// -------------------------------------------------------------

app.get('/api/images/:filename', (req, res) => {
  const eDriveDir = path.resolve(process.cwd(), 'E_drive');
  const filePath = path.join(eDriveDir, req.params.filename);
  
  if (!filePath.startsWith(eDriveDir)) {
    return res.status(403).send('Access denied');
  }

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('Image not found');
  }
});

// -------------------------------------------------------------
// VITE MIDDLEWARE SETUP & STATIC SERVING
// -------------------------------------------------------------

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production' && !process.argv.some(arg => arg.includes('server.cjs'));
  
  if (isDev) {
    // During development, we can run Vite directly (npm run dev on 5175).
    // If we run this script directly, we use middleware mode.
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
        root: path.join(process.cwd(), 'silicon-pulse-ui'),
        configFile: path.join(process.cwd(), 'silicon-pulse-ui', 'vite.config.ts')
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.warn("Vite middleware failed to load, you might need to run npm install in silicon-pulse-ui.");
    }
  } else {
    // Production asset pipelines
    const distPath = path.join(process.cwd(), 'silicon-pulse-ui', 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[NHỊP ĐẬP CÔNG NGHỆ WEB] Server booted on port ${PORT}`);
  });
}

startServer();
