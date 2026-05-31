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
      `);
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
      `);

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
