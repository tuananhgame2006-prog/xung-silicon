/* Copyright (c) 2026 Tuấn Anh (tuananhgame2006). Tác phẩm được bảo hộ bản quyền. Nghiêm cấm sao chép dưới mọi hình thức. */
// API Bridge Layer: Isolates the UI from the Python SEO Backend

const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3000/api';

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  publishDate: string;
}

export interface ArticleSubmission {
  title: string;
  content: string;
  category: string;
  authorEmail: string;
}

export const seoBridge = {
  /**
   * Fetch the latest published articles from the SEO backend.
   */
  async fetchLatestNews(): Promise<Article[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/news`);
      if (!response.ok) throw new Error('Failed to fetch news');
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch latest news:', error);
      throw error;
    }
  },

  /**
   * Submit an article to the Admin/SEO Pipeline for QA and approval.
   */
  async submitArticleForApproval(articleData: ArticleSubmission): Promise<{ success: boolean; message: string }> {
    try {
      console.log('Sending to backend QA Pipeline:', articleData);
      const response = await fetch(`${API_BASE_URL}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData)
      });
      if (!response.ok) throw new Error('Failed to submit article');
      const data = await response.json();
      return { success: true, message: data.message };
    } catch (error) {
      console.error('Submission failed:', error);
      throw error;
    }
  },

  /**
   * Request OTP for registration.
   */
  async requestOTP(email: string): Promise<{ success: boolean }> {
    try {
      console.log('Requesting OTP for:', email);
      const response = await fetch(`${API_BASE_URL}/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (!response.ok) throw new Error('Failed to request OTP');
      return { success: true };
    } catch (error) {
      console.error('OTP request failed:', error);
      throw error;
    }
  },

  /**
   * Register user for the newsletter.
   */
  async registerUser(email: string, code: string): Promise<{ success: boolean }> {
    try {
      console.log('Registering user email:', email);
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to register user');
      }
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  /**
   * Verify registration code
   */
  async verifyRegistration(email: string, code: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log('Verifying registration:', email, code);
      const response = await fetch(`${API_BASE_URL}/verify-registration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to verify registration');
      }
      const data = await response.json();
      return { success: true, message: data.message };
    } catch (error) {
      console.error('Verification failed:', error);
      throw error;
    }
  },

  /**
   * Admin Login
   */
  async login(email: string, password: string): Promise<{ role: string; token: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) throw new Error('Invalid credentials');
      return await response.json();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  /**
   * Fetch pending articles for Admin Dashboard
   */
  async getPendingArticles(token: string): Promise<Article[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/pending-articles`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch pending articles');
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch pending articles:', error);
      throw error;
    }
  },

  /**
   * Approve an article
   */
  async approveArticle(articleId: string, token: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/approve/${articleId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to approve article');
      const data = await response.json();
      return { success: true, message: data.message };
    } catch (error) {
      console.error('Approval failed:', error);
      throw error;
    }
  },

  /**
   * Reject an article
   */
  async rejectArticle(articleId: string, token: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/reject/${articleId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to reject article');
      const data = await response.json();
      return { success: true, message: data.message };
    } catch (error) {
      console.error('Rejection failed:', error);
      throw error;
    }
  },

  /**
   * Delete an article completely
   */
  async deleteArticle(articleId: string, token: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/article/${articleId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to delete article');
      const data = await response.json();
      return { success: true, message: data.message };
    } catch (error) {
      console.error('Delete failed:', error);
      throw error;
    }
  },

  /**
   * Create Community Post
   */
  async createCommunityPost(postData: any): Promise<{ success: boolean; id: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/community/post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });
      if (!response.ok) throw new Error('Failed to create post');
      return await response.json();
    } catch (error) {
      console.error('Failed to create post:', error);
      throw error;
    }
  },

  /**
   * Fetch Community Posts
   */
  async getCommunityPosts(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/community/posts`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      return [];
    }
  },

  /**
   * Delete Community Post (Admin)
   */
  async deleteCommunityPost(postId: string, token: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${API_BASE_URL}/community/post/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to delete community post');
      return { success: true };
    } catch (error) {
      console.error('Failed to delete community post:', error);
      throw error;
    }
  },

  async createCommunityComment(data: { postId: string, author: string, content: string }): Promise<{success: boolean, id: string}> {
    const response = await fetch(`${API_BASE_URL}/community/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create comment');
    return await response.json();
  },

  async deleteCommunityComment(id: string, token: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/community/comment/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to delete comment');
  },

  /**
   * Verify an existing admin token
   */
  async verifyToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/verify`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.ok;
    } catch {
      return false;
    }
  },

  async getHiddenArticles(): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/hidden-articles`);
      if (response.ok) return await response.json();
      return [];
    } catch {
      return [];
    }
  }
};
