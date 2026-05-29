import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ThumbsUp, MessageCircle, Share2, MoreHorizontal, Send, Image as ImageIcon, Smile, Cpu, X, Bookmark, Flag, Bell, Heart, Lightbulb, Rocket } from 'lucide-react';
import { AuthModal, type UserData } from '../components/AuthModal';
import { useToast } from '../components/ToastContext';
import { useAuth } from '../components/AuthContext';
import { useConfirm } from '../components/ConfirmContext';

// --- Types ---
export type CommentType = {
  id: number;
  author: string;
  time: string;
  content: string;
  likes: number;
  isLiked: boolean;
  replies: CommentType[];
};

export type ReactionType = 'like' | 'heart' | 'bulb' | 'rocket' | null;

export type PostType = {
  id: number;
  category: string;
  author: string;
  authorRole: string;
  time: string;
  content: string;
  image?: string;
  likes: number; // total reactions
  userReaction: ReactionType;
  comments: CommentType[];
};

const MOCK_IMAGE = "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80";
const EMOJIS = ['😀', '😂', '🔥', '🚀', '🧠', '💡', '❤️', '👍', '🤔', '👀'];

export const CommunityPage = () => {
  const [currentUser, setCurrentUser] = useState<UserData>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chung' | 'ban-dan' | 'ai'>('chung');
  
  // Post Creation State
  const [newPostContent, setNewPostContent] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  
  // Interaction States
  const [activeCommentPost, setActiveCommentPost] = useState<number | null>(null);
  const [replyingTo, setReplyingTo] = useState<{postId: number, commentId: number, authorName: string} | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [activePostMenu, setActivePostMenu] = useState<number | null>(null);
  
  const { showToast } = useToast();
  const { confirmAction } = useConfirm();
  const { isAdmin } = useAuth();

  const handleAdminDeletePost = (postId: number) => {
    confirmAction('Xóa bài đăng này?', () => {
      setPosts(prev => prev.filter(p => p.id !== postId));
      showToast('Đã xóa bài đăng (Dữ liệu ảo).');
    });
  };

  const handleAdminDeleteComment = (postId: number, commentId: number, isReply: boolean = false, parentId?: number) => {
    confirmAction('Xóa bình luận này?', () => {
      setPosts(prev => prev.map(p => {
        if (p.id !== postId) return p;
        let updatedComments = [...p.comments];
        if (isReply && parentId) {
          updatedComments = updatedComments.map(c => {
            if (c.id !== parentId) return c;
            return { ...c, replies: c.replies.filter(r => r.id !== commentId) };
          });
        } else {
          updatedComments = updatedComments.filter(c => c.id !== commentId);
        }
        return { ...p, comments: updatedComments };
      }));
      showToast('Đã xóa bình luận (Dữ liệu ảo).');
    });
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const [posts, setPosts] = useState<PostType[]>([
    {
      id: 1,
      category: 'ban-dan',
      author: 'Nguyễn Văn Minh',
      authorRole: 'Kỹ sư Thiết kế Vi mạch, Marvell',
      time: '2 giờ trước',
      content: 'Mọi người nghĩ sao về kiến trúc Vera Rubin mới của Nvidia? Tích hợp HBM4 trực tiếp lên đế chip có vẻ sẽ tạo ra thách thức tản nhiệt khổng lồ. Có ai từng làm mô phỏng nhiệt (thermal simulation) cho các chip >1000W chưa?',
      likes: 45,
      userReaction: null,
      comments: [
        {
          id: 101,
          author: 'Lê Hoàng',
          time: '1 giờ trước',
          content: 'Mình đang làm R&D cho tản nhiệt chất lỏng (Liquid Cooling) đây. Ở ngưỡng >1000W thì tản khí truyền thống coi như bỏ. Chắc chắn NVIDIA phải ép các Data Center nâng cấp hệ thống làm mát.',
          likes: 12,
          isLiked: false,
          replies: [
            {
              id: 1011,
              author: 'Nguyễn Văn Minh',
              time: '45 phút trước',
              content: 'Đồng ý với bác, nhưng mật độ bóng bán dẫn quá cao ở TSMC 3nm/2nm cũng khiến việc tản nhiệt điểm (Hotspot) cực khó.',
              likes: 4,
              isLiked: false,
              replies: []
            }
          ]
        }
      ]
    },
    {
      id: 2,
      category: 'ai',
      author: 'Trần Thị Hà',
      authorRole: 'Nghiên cứu sinh AI, ĐH Quốc gia',
      time: '5 giờ trước',
      content: 'Tin vui! Mình vừa bảo vệ thành công luận án về tối ưu hóa Transformer bằng cơ chế Sparse Attention. Cảm ơn Xung Silicon vì bài báo "Attention Is All You Need" bản dịch cực chuẩn. Bạn nào cần tham khảo source code PyTorch thì ping mình nhé!',
      image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80',
      likes: 128,
      userReaction: 'like',
      comments: [
        {
          id: 201,
          author: 'Phạm Tuấn',
          time: '3 giờ trước',
          content: 'Chúc mừng Hà nhé! Tuyệt vời quá 🚀',
          likes: 5,
          isLiked: true,
          replies: []
        }
      ]
    }
  ]);

  const handlePostFocus = () => {
    if (!currentUser) setIsAuthOpen(true);
  };

  const handlePostSubmit = () => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    if (!newPostContent.trim() && !attachedImage) return;
    
    const newPost: PostType = {
      id: Date.now(),
      category: activeTab === 'chung' ? 'chung' : activeTab,
      author: currentUser.name,
      authorRole: 'Thành viên Xung Silicon',
      time: 'Vừa xong',
      content: newPostContent,
      image: attachedImage || undefined,
      likes: 0,
      userReaction: null,
      comments: []
    };
    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setAttachedImage(null);
    showToast('Đã xuất bản bài viết thành công!');
  };

  const handleReaction = (id: number, type: ReactionType) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    setPosts(posts.map(p => {
      if (p.id === id) {
        // If clicking the same reaction, remove it (unlike). 
        // If clicking a new reaction, change it.
        // If changing from null to a reaction, increase count.
        // If changing from reaction to null, decrease count.
        // If changing reaction to reaction, count stays same.
        let newLikes = p.likes;
        let newReaction = type;

        if (p.userReaction === type) {
          newReaction = null;
          newLikes -= 1;
        } else if (p.userReaction === null) {
          newLikes += 1;
        }

        return { ...p, userReaction: newReaction, likes: newLikes };
      }
      return p;
    }));
  };

  const handleLikeComment = (postId: number, commentId: number, isReply: boolean = false, parentId?: number) => {
    setPosts(posts.map(p => {
      if (p.id !== postId) return p;
      const newComments = p.comments.map(c => {
        if (!isReply && c.id === commentId) {
          return { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 };
        }
        if (isReply && c.id === parentId) {
          return {
            ...c,
            replies: c.replies.map(r => r.id === commentId ? { ...r, isLiked: !r.isLiked, likes: r.isLiked ? r.likes - 1 : r.likes + 1 } : r)
          };
        }
        return c;
      });
      return { ...p, comments: newComments };
    }));
  };

  const handleSubmitComment = (postId: number) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    if (!commentInput.trim()) return;

    const newComment: CommentType = {
      id: Date.now(),
      author: currentUser.name,
      time: 'Vừa xong',
      content: commentInput,
      likes: 0,
      isLiked: false,
      replies: []
    };

    setPosts(posts.map(p => {
      if (p.id !== postId) return p;
      
      if (replyingTo && replyingTo.postId === postId) {
        // Add as reply
        const newComments = p.comments.map(c => {
          if (c.id === replyingTo.commentId) {
            return { ...c, replies: [...c.replies, newComment] };
          }
          return c;
        });
        return { ...p, comments: newComments };
      } else {
        // Add as top-level comment
        return { ...p, comments: [...p.comments, newComment] };
      }
    }));
    
    setCommentInput('');
    setReplyingTo(null);
    showToast('Đã gửi bình luận!');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Đã sao chép liên kết bài đăng!');
  };

  const handleActionToast = (msg: string) => {
    showToast(msg);
    setActivePostMenu(null);
  };

  const addEmoji = (emoji: string) => {
    setNewPostContent(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const attachMockImage = () => {
    setAttachedImage(MOCK_IMAGE);
    showToast('Đã đính kèm ảnh mô phỏng!');
  };

  const filteredPosts = activeTab === 'chung' ? posts : posts.filter(p => p.category === activeTab || p.category === 'chung');

  const countTotalComments = (post: PostType) => {
    let count = post.comments.length;
    post.comments.forEach(c => count += c.replies.length);
    return count;
  };

  const renderActiveReaction = (reaction: ReactionType) => {
    switch (reaction) {
      case 'heart': return <><Heart size={16} className="text-rose-500 fill-current" /> <span className="hidden sm:inline text-rose-600">Tâm đắc</span></>;
      case 'bulb': return <><Lightbulb size={16} className="text-amber-500 fill-current" /> <span className="hidden sm:inline text-amber-600">Sáng tạo</span></>;
      case 'rocket': return <><Rocket size={16} className="text-indigo-500 fill-current" /> <span className="hidden sm:inline text-indigo-600">Đột phá</span></>;
      case 'like': return <><ThumbsUp size={16} className="text-cyan-600 fill-current" /> <span className="hidden sm:inline text-cyan-700">Thích</span></>;
      default: return <><ThumbsUp size={16} /> <span className="hidden sm:inline">Thích</span></>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-20 font-sans">
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onLoginSuccess={(user) => setCurrentUser(user)} />

      {/* Header Nav */}
      <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-slate-500 hover:text-cyan-600 flex items-center gap-2 transition-colors text-sm font-medium">
            <ArrowLeft size={16} /> Về Trang chủ
          </Link>
          <div className="flex items-center gap-2">
            <Cpu className="text-cyan-500 w-6 h-6" />
            <span className="font-serif text-lg tracking-wide text-slate-800 hidden sm:inline">CỘNG ĐỒNG SILICON</span>
          </div>
          <div className="flex items-center gap-4">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold text-sm">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="text-sm font-medium text-slate-700 hidden sm:inline">{currentUser.name}</span>
              </div>
            ) : (
              <button onClick={() => setIsAuthOpen(true)} className="text-sm font-bold text-cyan-600 hover:text-cyan-700">Đăng nhập</button>
            )}
          </div>
        </div>

        {/* Sub-Nav Filters */}
        <div className="max-w-3xl mx-auto px-4 flex gap-6 pt-2 overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab('chung')} className={`whitespace-nowrap pb-3 text-sm font-bold border-b-2 transition-colors px-2 ${activeTab === 'chung' ? 'text-cyan-600 border-cyan-600' : 'text-slate-500 border-transparent hover:text-slate-800'}`}>Cộng đồng Chung</button>
          <button onClick={() => setActiveTab('ban-dan')} className={`whitespace-nowrap pb-3 text-sm font-bold border-b-2 transition-colors px-2 ${activeTab === 'ban-dan' ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-800'}`}>Tin tức & Hỏi đáp Bán Dẫn</button>
          <button onClick={() => setActiveTab('ai')} className={`whitespace-nowrap pb-3 text-sm font-bold border-b-2 transition-colors px-2 ${activeTab === 'ai' ? 'text-rose-600 border-rose-600' : 'text-slate-500 border-transparent hover:text-slate-800'}`}>Thảo luận Trí tuệ Nhân tạo</button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 mt-8">
        
        {/* Create Post Box */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 relative">
          <div className="flex gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex-shrink-0 flex items-center justify-center text-white font-bold">
              {currentUser ? currentUser.name.charAt(0).toUpperCase() : 'B'}
            </div>
            <div className="w-full">
              <textarea 
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                onClick={handlePostFocus}
                placeholder={currentUser ? `${currentUser.name} ơi, bạn đang nghĩ gì về công nghệ lõi?` : "Bạn đang nghĩ gì về công nghệ lõi? Đăng nhập để chia sẻ..."}
                className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-purple-400 rounded-xl px-4 py-3 text-sm resize-none transition-colors outline-none"
                rows={3}
              />
              {attachedImage && (
                <div className="relative mt-3 w-32 h-32 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                  <img src={attachedImage} alt="Attachment" className="w-full h-full object-cover" />
                  <button onClick={() => setAttachedImage(null)} className="absolute top-1 right-1 bg-slate-900/60 text-white rounded-full p-1 hover:bg-slate-900 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 relative">
            <div className="flex gap-2 relative">
              <button onClick={attachMockImage} className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:bg-slate-50 rounded-lg text-sm font-semibold transition-colors">
                <ImageIcon size={18} className="text-emerald-500" /> Ảnh/Video
              </button>
              
              <div className="relative" ref={emojiPickerRef}>
                <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:bg-slate-50 rounded-lg text-sm font-semibold transition-colors">
                  <Smile size={18} className="text-amber-500" /> Cảm xúc
                </button>
                
                {/* Emoji Popover */}
                {showEmojiPicker && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-50 flex gap-2 flex-wrap w-48">
                    {EMOJIS.map(e => (
                      <button key={e} onClick={() => addEmoji(e)} className="text-xl hover:scale-125 hover:bg-slate-100 p-1 rounded transition-transform">
                        {e}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button 
              onClick={handlePostSubmit}
              disabled={!newPostContent.trim() && !attachedImage}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-500 text-purple-400 font-bold px-6 py-2 rounded-lg transition-colors text-sm shadow-md"
            >
              <Send size={16} /> Gửi Phê Duyệt
            </button>
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-visible relative">
              <div className="p-5 flex justify-between items-start">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold font-serif text-lg">
                    {post.author.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      {post.author}
                      {post.category === 'ban-dan' && <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold">Bán dẫn</span>}
                      {post.category === 'ai' && <span className="bg-rose-100 text-rose-700 text-[10px] px-2 py-0.5 rounded-full font-bold">AI</span>}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">{post.authorRole}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{post.time}</p>
                  </div>
                </div>
                
                {/* Options Menu */}
                <div className="relative flex items-center gap-2">
                  {isAdmin && (
                    <button 
                      onClick={() => handleAdminDeletePost(post.id)}
                      className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-600 px-2 py-1 rounded border border-rose-200 font-bold transition-colors"
                    >
                      Xóa
                    </button>
                  )}
                  <button 
                    onClick={() => setActivePostMenu(activePostMenu === post.id ? null : post.id)} 
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50"
                  >
                    <MoreHorizontal size={20} />
                  </button>
                  {activePostMenu === post.id && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setActivePostMenu(null)}></div>
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in duration-150">
                        <button onClick={() => handleActionToast('Đã lưu bài viết.')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                          <Bookmark size={16} /> Lưu bài viết
                        </button>
                        <button onClick={() => handleActionToast('Đã bật thông báo cho bài viết.')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                          <Bell size={16} /> Bật thông báo
                        </button>
                        <button onClick={() => handleActionToast('Đã báo cáo bài viết. Cảm ơn bạn.')} className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2">
                          <Flag size={16} /> Báo cáo vi phạm
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="px-5 pb-4">
                <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
              </div>

              {post.image && (
                <div className="w-full overflow-hidden border-y border-slate-100">
                   <img src={post.image} alt="Post content" className="w-full object-cover max-h-96" />
                </div>
              )}

              <div className="px-5 py-2 flex justify-between text-xs text-slate-500 border-t border-slate-100">
                <span className="flex items-center gap-1"><ThumbsUp size={12} className="text-cyan-500" /> {post.likes}</span>
                <span>{countTotalComments(post)} bình luận</span>
              </div>

              <div className="px-2 py-1 flex items-center justify-between border-y border-slate-100 bg-slate-50/50 flex-wrap sm:flex-nowrap gap-1">
                
                {/* Facebook-style Reaction Popover Group */}
                <div className="relative group flex-1">
                  {/* Reaction Popover Wrapper (Hidden by default, shown on group hover) */}
                  <div className="absolute bottom-full left-0 pb-2 hidden group-hover:flex z-50 animate-in fade-in zoom-in duration-150">
                    <div className="bg-white shadow-xl border border-slate-200 rounded-full px-3 py-2 gap-3 flex items-center">
                      <button onClick={() => handleReaction(post.id, 'like')} className="hover:scale-125 transition-transform origin-bottom" title="Thích">
                        <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600"><ThumbsUp size={18} className="fill-current"/></div>
                      </button>
                      <button onClick={() => handleReaction(post.id, 'heart')} className="hover:scale-125 transition-transform origin-bottom" title="Tâm đắc">
                        <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-500"><Heart size={18} className="fill-current"/></div>
                      </button>
                      <button onClick={() => handleReaction(post.id, 'bulb')} className="hover:scale-125 transition-transform origin-bottom" title="Sáng tạo">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-500"><Lightbulb size={18} className="fill-current"/></div>
                      </button>
                      <button onClick={() => handleReaction(post.id, 'rocket')} className="hover:scale-125 transition-transform origin-bottom" title="Đột phá">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500"><Rocket size={18} className="fill-current"/></div>
                      </button>
                    </div>
                  </div>
                  
                  {/* Main Reaction Button */}
                  <button 
                    onClick={() => handleReaction(post.id, post.userReaction || 'like')}
                    className={`w-full flex justify-center items-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-colors ${post.userReaction ? 'bg-slate-100/50' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    {renderActiveReaction(post.userReaction)}
                  </button>
                </div>
                
                <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>

                <button 
                  onClick={() => {
                    setActiveCommentPost(activeCommentPost === post.id ? null : post.id);
                    setReplyingTo(null);
                  }}
                  className="flex-1 flex justify-center items-center gap-1.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-semibold transition-colors"
                >
                  <MessageCircle size={16} /> <span className="hidden sm:inline">Bình luận</span>
                </button>
                <button 
                  onClick={handleShare}
                  className="flex-1 flex justify-center items-center gap-1.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-semibold transition-colors"
                >
                  <Share2 size={16} /> <span className="hidden sm:inline">Chia sẻ</span>
                </button>
              </div>

              {/* Advanced Facebook-style Comment Section */}
              {activeCommentPost === post.id && (
                <div className="bg-white rounded-b-2xl">
                  {/* Comments List (Limited to ~5 comments) */}
                  <div className="px-5 py-4 space-y-4 max-h-[360px] overflow-y-auto custom-scrollbar">
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs flex-shrink-0">
                          {comment.author.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="bg-slate-100 rounded-2xl px-4 py-2 inline-block">
                            <span className="font-bold text-xs text-slate-900 block">{comment.author}</span>
                            <span className="text-sm text-slate-700">{comment.content}</span>
                          </div>
                          
                          {/* Comment Actions */}
                          <div className="flex items-center gap-4 mt-1 ml-2 text-[11px] font-bold text-slate-500">
                            <button onClick={() => handleLikeComment(post.id, comment.id)} className={`hover:underline ${comment.isLiked ? 'text-cyan-600' : ''}`}>Thích</button>
                            <button onClick={() => {
                              setReplyingTo({postId: post.id, commentId: comment.id, authorName: comment.author});
                              document.getElementById(`comment-input-${post.id}`)?.focus();
                            }} className="hover:underline">Phản hồi</button>
                            <span className="text-slate-400 font-medium">{comment.time}</span>
                            {comment.likes > 0 && <span className="flex items-center gap-1 font-medium text-slate-400"><ThumbsUp size={10} className="text-cyan-500 fill-current"/> {comment.likes}</span>}
                            {isAdmin && <button onClick={() => handleAdminDeleteComment(post.id, comment.id)} className="text-rose-500 hover:underline">Xóa</button>}
                          </div>

                          {/* Nested Replies */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-3 space-y-3">
                              {comment.replies.map(reply => (
                                <div key={reply.id} className="flex gap-3">
                                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-[10px] flex-shrink-0">
                                    {reply.author.charAt(0)}
                                  </div>
                                  <div className="flex-1">
                                    <div className="bg-slate-100 rounded-2xl px-3 py-1.5 inline-block">
                                      <span className="font-bold text-[11px] text-slate-900 block">{reply.author}</span>
                                      <span className="text-[13px] text-slate-700">{reply.content}</span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-1 ml-2 text-[10px] font-bold text-slate-500">
                                      <button onClick={() => handleLikeComment(post.id, reply.id, true, comment.id)} className={`hover:underline ${reply.isLiked ? 'text-cyan-600' : ''}`}>Thích</button>
                                      <span className="text-slate-400 font-medium">{reply.time}</span>
                                      {reply.likes > 0 && <span className="flex items-center gap-1 font-medium text-slate-400"><ThumbsUp size={10} className="text-cyan-500 fill-current"/> {reply.likes}</span>}
                                      {isAdmin && <button onClick={() => handleAdminDeleteComment(post.id, reply.id, true, comment.id)} className="text-rose-500 hover:underline">Xóa</button>}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Comment Input Box */}
                  <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
                    {replyingTo && replyingTo.postId === post.id && (
                      <div className="text-xs text-slate-500 mb-2 flex justify-between items-center bg-slate-100 px-3 py-1 rounded-md">
                        <span>Đang trả lời <strong>{replyingTo.authorName}</strong></span>
                        <button onClick={() => setReplyingTo(null)} className="hover:text-slate-700 p-0.5"><X size={12} /></button>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                        {currentUser ? currentUser.name.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div className="flex-grow flex items-center bg-white border border-slate-200 rounded-2xl px-4 py-1.5 focus-within:ring-2 focus-within:ring-cyan-200 focus-within:border-cyan-300 transition-all shadow-sm">
                        <input 
                          id={`comment-input-${post.id}`}
                          type="text" 
                          value={commentInput}
                          onChange={(e) => setCommentInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment(post.id)}
                          placeholder={currentUser ? "Viết bình luận..." : "Đăng nhập để bình luận..."}
                          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 py-1"
                          onClick={() => !currentUser && setIsAuthOpen(true)}
                        />
                        <button 
                          onClick={() => handleSubmitComment(post.id)}
                          disabled={!commentInput.trim()}
                          className="text-cyan-600 hover:text-cyan-700 p-1 disabled:opacity-50 disabled:hover:text-cyan-600"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {filteredPosts.length === 0 && (
            <div className="text-center py-10 text-slate-500">Chưa có bài viết nào trong chuyên mục này.</div>
          )}
        </div>
      </div>
    </div>
  );
};
