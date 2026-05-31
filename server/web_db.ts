import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = process.env.RAILWAY_VOLUME_MOUNT_PATH 
  ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, 'web_data.db') 
  : path.join(process.cwd(), 'web_data.db');
export const webDb = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening web_data.db:', err.message);
  } else {
    console.log('Connected to Web SQLite database.');
    
    // Initialize tables
    webDb.serialize(() => {
      // Pending Articles
      webDb.run(`
        CREATE TABLE IF NOT EXISTS pending_articles (
          id TEXT PRIMARY KEY,
          title TEXT,
          excerpt TEXT,
          content TEXT,
          category TEXT,
          author TEXT,
          publishDate TEXT,
          status TEXT DEFAULT 'pending'
        )
      `);

      // Hidden Articles (Admin deletions of mock articles)
      webDb.run(`
        CREATE TABLE IF NOT EXISTS hidden_articles (
          id TEXT PRIMARY KEY
        )
      `);

      // Community Posts
      webDb.run(`
        CREATE TABLE IF NOT EXISTS community_posts (
          id TEXT PRIMARY KEY,
          author TEXT,
          authorRole TEXT,
          time TEXT,
          content TEXT,
          category TEXT,
          likes INTEGER DEFAULT 0,
          shares INTEGER DEFAULT 0,
          image TEXT
        )
      `, () => {
        webDb.get('SELECT COUNT(*) as count FROM community_posts', (err, row: any) => {
          if (row && row.count === 0) {
            webDb.exec(`
              INSERT INTO community_posts (id, author, authorRole, time, content, category) VALUES 
              ('post-1', 'TS. Lê Minh', 'Kỹ sư Thiết kế Vi mạch @ FPT Semi', '2 giờ trước', 'Tôi vừa test thử luồng cấp nguồn mặt lưng (PowerVia) trên mô phỏng ngã tư, kết quả cho thấy giảm IR drop tới 30%. Có ai đang làm mảng này không?', 'Thảo luận Kỹ thuật'),
              ('post-2', 'Nguyễn Hoàng AI', 'Data Scientist @ VinAI', '5 giờ trước', 'Kiến trúc MoE của Gemini 1.5 Pro thực sự quá khủng. Khả năng nhồi 2 triệu token ngữ cảnh sẽ thay đổi hoàn toàn cách chúng ta làm RAG (Retrieval-Augmented Generation).', 'Chia sẻ Kiến thức')
            `);
          }
        });
      });
      // Community Comments
      webDb.run(`
        CREATE TABLE IF NOT EXISTS community_comments (
          id TEXT PRIMARY KEY,
          postId TEXT,
          author TEXT,
          time TEXT,
          content TEXT,
          FOREIGN KEY(postId) REFERENCES community_posts(id)
        )
      `, () => {
        webDb.get('SELECT COUNT(*) as count FROM community_comments', (err, row: any) => {
          if (row && row.count === 0) {
            webDb.exec(`
              INSERT INTO community_comments (id, postId, author, time, content) VALUES
              ('comment-1', 'post-1', 'Trần Văn B', '1 giờ trước', 'Hay quá anh, anh dùng tool EDA nào để simulate vậy?'),
              ('comment-2', 'post-2', 'Lê Quỳnh', '3 giờ trước', 'Đúng rồi, mình test nhồi nguyên cuốn sách vào nó vẫn hiểu được plot.')
            `);
          }
        });
      });

      // Subscribers (Newsletter)
      webDb.run(`
        CREATE TABLE IF NOT EXISTS subscribers (
          email TEXT PRIMARY KEY,
          subscribedAt TEXT
        )
      `);
      
      // OTPs
      webDb.run(`
        CREATE TABLE IF NOT EXISTS otps (
          email TEXT PRIMARY KEY,
          code TEXT,
          expiresAt INTEGER
        )
      `);
    });
  }
});

// Helper functions
export const query = (sql: string, params: any[] = []): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    webDb.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const run = (sql: string, params: any[] = []): Promise<void> => {
  return new Promise((resolve, reject) => {
    webDb.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve();
    });
  });
};
