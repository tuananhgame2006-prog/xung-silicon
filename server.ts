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
import { query, run } from './server/web_db.js';

dotenv.config({ path: '.env.local' }); // Load .env.local for ADMIN_EMAIL, ADMIN_PASSWORD, JWT_SECRET

const app = express();
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

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === '') {
  console.error("FATAL ERROR: JWT_SECRET is not defined in .env.local. Shutting down for defense-grade security.");
  process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET;

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
// MAILER CONFIGURATION (REMOVED)
// -------------------------------------------------------------

// -------------------------------------------------------------
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
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
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
    await run('DELETE FROM pending_articles WHERE id = ?', [req.params.id]);
    res.json({ message: 'Article deleted permanently.' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
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
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/register', apiLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Email không hợp lệ.' });
  }
  const cleanEmail = xss(email);
  try {
    await run('INSERT INTO subscribers (email, subscribedAt) VALUES (?, ?)', [cleanEmail, new Date().toISOString()]);
    res.json({ success: true, message: 'Đăng ký nhận bản tin thành công!' });
  } catch (err: any) {
    if (err.message && err.message.includes('UNIQUE')) {
      res.status(400).json({ error: 'Email này đã được đăng ký từ trước.' });
    } else {
      res.status(500).json({ error: 'Lỗi cơ sở dữ liệu.' });
    }
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
  if (process.env.NODE_ENV !== 'production') {
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
