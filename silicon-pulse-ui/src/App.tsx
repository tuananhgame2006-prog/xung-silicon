import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Cpu, BookOpen, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import { seoBridge } from './api/seoBridge';
import { TechSwarmBackground } from './components/TechSwarmBackground';
import { mockArticles } from './data/mockArticles';
import { ArticlePage } from './pages/ArticlePage';
import { CategoryPage } from './pages/CategoryPage';
import { CommunityPage } from './pages/CommunityPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { ToastProvider, useToast } from './components/ToastContext';
import { AuthProvider, useAuth } from './components/AuthContext';
import { ConfirmProvider, useConfirm } from './components/ConfirmContext';
import type { Article } from './api/seoBridge';
// --- Scroll Restoration Helper --- //
const ScrollRestorationHelper = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const el = document.getElementById(location.hash.substring(1));
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const savedY = sessionStorage.getItem(`scroll_${location.key}`);
      if (savedY) {
        setTimeout(() => window.scrollTo(0, parseInt(savedY, 10)), 10);
      } else {
        window.scrollTo(0, 0);
      }
    }
  }, [location.key, location.hash]);

  useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem(`scroll_${location.key}`, window.scrollY.toString());
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.key]);

  return null;
};

// --- Components --- //

export const parseDate = (dateStr: string) => {
  if (!dateStr) return 0;
  let timeStr = '00:00';
  let datePart = dateStr;
  if (dateStr.includes(' - ')) {
    const parts = dateStr.split(' - ');
    timeStr = parts[0].trim();
    datePart = parts[1].trim();
  }
  const parts = datePart.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return new Date(`${year}-${month}-${day}T${timeStr}:00`).getTime();
  }
  return 0;
};

export const sortArticles = (articles: typeof mockArticles) => {
  return [...articles].sort((a, b) => parseDate(b.date) - parseDate(a.date));
};


const Navbar = ({ setShowSubscribeModal }: { setShowSubscribeModal: (s: boolean) => void }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'glass-nav py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <a href="/" onClick={handleHomeClick} className="flex items-center gap-2">
          <Cpu className="text-cyan-500 w-8 h-8" />
          <span className="font-serif text-2xl tracking-wide text-slate-800">NHỊP ĐẬP CÔNG NGHỆ</span>
        </a>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a href="/" onClick={handleHomeClick} className="text-slate-600 hover:text-cyan-500 transition-colors cursor-pointer">Trang chủ</a>
          <Link to="/#foundational-docs" className="text-slate-600 hover:text-cyan-500 transition-colors">Tài liệu Nền tảng</Link>
          <Link to="/#semi-news" className="text-slate-600 hover:text-cyan-500 transition-colors">Tin tức Bán dẫn</Link>
          <Link to="/#ai-news" className="text-slate-600 hover:text-cyan-500 transition-colors">Tin tức AI</Link>
          <Link to="/community" className="text-slate-600 hover:text-cyan-500 transition-colors">Cộng đồng</Link>
          <button 
            onClick={() => setShowSubscribeModal(true)}
            className="glass-button px-5 py-2 rounded-full font-semibold text-cyan-600"
          >
            Đăng ký Nhận tin
          </button>
        </div>

        <button className="md:hidden text-slate-800" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-md border-b border-slate-200 overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-4 text-sm font-medium">
              <a href="/" onClick={(e) => { handleHomeClick(e); setMobileMenuOpen(false); }} className="text-slate-600 hover:text-cyan-500">Trang chủ</a>
              <Link to="/#foundational-docs" onClick={() => setMobileMenuOpen(false)} className="text-slate-600 hover:text-cyan-500">Tài liệu Nền tảng</Link>
              <Link to="/#semi-news" onClick={() => setMobileMenuOpen(false)} className="text-slate-600 hover:text-cyan-500">Tin tức Bán dẫn</Link>
              <Link to="/#ai-news" onClick={() => setMobileMenuOpen(false)} className="text-slate-600 hover:text-cyan-500">Tin tức AI</Link>
              <Link to="/community" onClick={() => setMobileMenuOpen(false)} className="text-slate-600 hover:text-cyan-500">Cộng đồng</Link>
              <button 
                onClick={() => { setMobileMenuOpen(false); setShowSubscribeModal(true); }}
                className="w-full mt-2 bg-cyan-50 text-cyan-700 px-5 py-3 rounded-xl font-bold border border-cyan-100"
              >
                Đăng ký Nhận tin
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const SubscribeModal = ({ showSubscribeModal, setShowSubscribeModal }: { showSubscribeModal: boolean, setShowSubscribeModal: (s: boolean) => void }) => {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');
    try {
      await seoBridge.requestOTP(email);
      setStep('code');
      setStatus('idle');
    } catch {
      setStatus('error');
      setErrorMessage('Không thể gửi OTP. Vui lòng kiểm tra lại email.');
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');
    try {
      await seoBridge.registerUser(email, code);
      setStatus('success');
      setTimeout(() => {
        setShowSubscribeModal(false);
        setStep('email');
        setEmail('');
        setCode('');
        setStatus('idle');
      }, 2000);
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Xác nhận thất bại.');
    }
  };



  return (
    <AnimatePresence>
      {showSubscribeModal && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="glass-panel p-8 rounded-2xl w-full max-w-md relative bg-white shadow-2xl"
          >
            <button onClick={() => {
              setShowSubscribeModal(false);
              setTimeout(() => {
                setStep('email');
                setEmail('');
                setCode('');
                setStatus('idle');
                setErrorMessage('');
              }, 300);
            }} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
            
            {status === 'success' ? (
              <div className="text-center py-6">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="font-serif text-2xl text-slate-800 mb-2">Đăng ký thành công!</h3>
                <p className="text-sm text-slate-500">Cảm ơn bạn đã tham gia cộng đồng.</p>
              </div>
            ) : (
              <>
                <h3 className="font-serif text-3xl mb-2 text-cyan-600">
                  {step === 'email' ? 'Nhận bản tin chuyên sâu' : 'Xác nhận Email'}
                </h3>
                <p className="text-sm text-slate-500 mb-6 font-sans">
                  {step === 'email' 
                    ? 'Cập nhật các phân tích độc quyền về công nghệ lõi bán dẫn và AI trực tiếp vào hộp thư của bạn.' 
                    : `Chúng tôi đã gửi mã xác nhận 4 chữ số đến email ${email}. Vui lòng kiểm tra hộp thư (và thư rác).`}
                </p>
                {errorMessage && (
                  <div className="mb-4 p-3 bg-rose-50 text-rose-600 text-sm rounded-lg border border-rose-100">
                    {errorMessage}
                  </div>
                )}
                {step === 'email' ? (
                  <form onSubmit={handleEmailSubmit}>
                    <input 
                      type="email" 
                      placeholder="Địa chỉ Email của bạn" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full glass-input px-4 py-3 rounded-lg mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      disabled={status === 'loading'}
                    />
                    <button 
                      type="submit" 
                      disabled={status === 'loading'}
                      className="w-full bg-cyan-500 text-white font-bold py-3 rounded-lg hover:bg-cyan-400 transition-colors flex justify-center items-center gap-2 disabled:opacity-50 shadow-md shadow-cyan-500/20"
                    >
                      {status === 'loading' ? <Loader2 className="animate-spin" size={20} /> : 'Tiếp tục'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleCodeSubmit}>
                    <input 
                      type="text" 
                      placeholder="Nhập mã 4 chữ số" 
                      required
                      maxLength={4}
                      pattern="\d{4}"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full glass-input px-4 py-3 rounded-lg mb-4 text-center text-2xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      disabled={status === 'loading'}
                    />
                    <button 
                      type="submit" 
                      disabled={status === 'loading' || code.length !== 4}
                      className="w-full bg-cyan-500 text-white font-bold py-3 rounded-lg hover:bg-cyan-400 transition-colors flex justify-center items-center gap-2 disabled:opacity-50 shadow-md shadow-cyan-500/20"
                    >
                      {status === 'loading' ? <Loader2 className="animate-spin" size={20} /> : 'Xác nhận & Đăng ký'}
                    </button>
                  </form>
                )}
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Hero = ({ onExploreClick }: { onExploreClick: () => void }) => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-slate-50">
      <TechSwarmBackground />
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-20 pointer-events-none">
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 drop-shadow-sm">
          Kỷ nguyên Trí tuệ Nhân tạo & Lõi Bán dẫn.
        </h1>
        <p className="font-sans text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto drop-shadow-sm">
          Tạp chí số uy tín phân tích sâu về chuỗi cung ứng vi mạch, kiến trúc Transformer và vật lý linh kiện.
        </p>
        <div className="pointer-events-auto">
          <button 
            onClick={onExploreClick}
            className="glass-button px-8 py-4 rounded-full text-lg font-semibold tracking-wide text-cyan-700 bg-white shadow-xl shadow-cyan-900/5 hover:text-cyan-600 transition-all duration-300"
          >
            Tìm hiểu ngay
          </button>
        </div>
      </div>
    </section>
  );
};

const ContentSections = () => {
  const { isAdmin, token } = useAuth();
  const { showToast } = useToast();
  const { confirmAction } = useConfirm();
  const [pendingArticles, setPendingArticles] = useState<Article[]>([]);
  const [hiddenArticles, setHiddenArticles] = useState<string[]>([]);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    if (isAdmin && token) {
      seoBridge.getPendingArticles(token).then(setPendingArticles).catch(console.error);
    }
    seoBridge.getHiddenArticles().then(setHiddenArticles).catch(console.error);
  }, [isAdmin, token, refresh]);

  const foundationalArticles = sortArticles(mockArticles.filter(a => a.category === 'foundational' && !hiddenArticles.includes(a.id)));
  const semiNewsArticles = sortArticles(mockArticles.filter(a => a.category === 'semi-news' && !hiddenArticles.includes(a.id)));
  const aiNewsArticles = sortArticles(mockArticles.filter(a => a.category === 'ai-news' && !hiddenArticles.includes(a.id)));

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (!token) return;
    confirmAction('Bạn có chắc chắn muốn xóa bài viết này?', async () => {
      try {
        await seoBridge.deleteArticle(id, token);
        showToast('Đã xóa bài viết!');
        setRefresh(r => r + 1);
      } catch {
        showToast('Xóa thất bại (hoặc dữ liệu tĩnh ảo).');
      }
    });
  };

  const handleApprove = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (!token) return;
    try {
      await seoBridge.approveArticle(id, token);
      showToast('Đã phê duyệt và xuất bản!');
      setRefresh(r => r + 1);
    } catch {
      showToast('Lỗi khi duyệt bài.');
    }
  };

  const renderCards = (articles: any[], categoryId: string, icon: React.ReactNode, highlightClass: string, isPendingList: boolean = false) => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {articles.slice(0, isPendingList ? 100 : 3).map((doc) => (
            <motion.div 
              key={doc.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-full relative group"
            >
              <Link to={`/article/${doc.id}`} className="block h-full group-hover:shadow-2xl transition-all duration-300 rounded-[2rem]">
                <motion.div whileHover={{ y: -8 }} className="glass-panel p-0 rounded-[2rem] flex flex-col h-full cursor-pointer bg-white overflow-hidden border border-slate-200">
                  <div className={`h-32 w-full bg-gradient-to-br ${doc.coverGradient || 'from-slate-800 to-slate-900'} relative`}>
                     <div className="absolute top-4 left-4 flex gap-2">
                       <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-bold uppercase tracking-wider border border-white/30">
                         {isPendingList ? 'CHỜ DUYỆT' : (doc.type === 'book' ? 'Sách' : doc.type === 'paper' ? 'Báo cáo IEEE' : doc.type === 'research' ? 'R&D Kỹ thuật' : 'Phân tích')}
                       </div>
                     </div>
                  </div>
                  
                  <div className="p-8 flex flex-col flex-grow -mt-8 bg-white rounded-t-3xl relative z-10">
                    <h3 className={`font-serif text-2xl mb-4 text-slate-900 group-hover:${highlightClass} transition-colors leading-snug`}>{doc.title}</h3>
                    <p className="text-sm text-slate-600 flex-grow leading-relaxed">{doc.excerpt || doc.content?.substring(0, 100)}</p>
                    
                    {!isPendingList && (
                      <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-wide">
                          {icon} {doc.readTime || '3 min read'}
                        </div>
                        <div className={`text-[10px] font-semibold text-slate-400 opacity-50`}>
                          {doc.date ? (doc.date.includes(' - ') ? doc.date.split(' - ')[1] : doc.date) : ''}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </Link>
              
              {/* Admin Overlay Controls */}
              {isAdmin && (
                <div className="absolute top-4 right-4 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isPendingList && (
                    <button onClick={(e) => handleApprove(e, doc.id)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded text-xs font-bold shadow-lg flex items-center gap-1">
                      <CheckCircle size={14} /> Duyệt
                    </button>
                  )}
                  <button onClick={(e) => handleDelete(e, doc.id)} className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded text-xs font-bold shadow-lg flex items-center gap-1">
                    <X size={14} /> Xóa
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {!isPendingList && articles.length > 3 && (
        <div className="mt-10 flex justify-center">
          <Link 
            to={`/category/${categoryId}`}
            className="glass-button px-6 py-2.5 rounded-full text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-2 shadow-sm"
          >
            Xem tất cả bài viết chuyên mục này &rarr;
          </Link>
        </div>
      )}
    </>
  );

  return (
    <div className="py-24 relative z-10 px-6 max-w-7xl mx-auto bg-slate-50">
      
      {/* Admin Pending Articles Section */}
      {isAdmin && pendingArticles.length > 0 && (
        <section id="pending-docs" className="mb-24 scroll-mt-24">
          <div className="inline-block group mb-2 border-l-8 border-rose-500 pl-4">
            <h2 className="font-serif text-3xl md:text-5xl text-rose-800 transition-colors flex items-center gap-4">
              Bài viết Chờ duyệt (Admin)
            </h2>
          </div>
          <p className="text-slate-500 text-base pl-6 mb-10">Danh sách các bài viết đang chờ quản trị viên phê duyệt để xuất bản lên trang chủ.</p>
          {renderCards(pendingArticles, 'pending', <CheckCircle size={14} className="text-rose-500"/>, "text-rose-600", true)}
        </section>
      )}

      {/* 1. Foundational Docs */}
      <section id="foundational-docs" className="mb-24 scroll-mt-24">
        <Link to="/category/foundational" className="inline-block group mb-2">
          <h2 className="font-serif text-3xl md:text-5xl text-cyan-800 border-l-8 border-cyan-500 pl-4 group-hover:text-cyan-600 transition-colors flex items-center gap-4">
            Tài liệu Nền tảng <span className="text-xl opacity-0 group-hover:opacity-100 transition-opacity">&rarr;</span>
          </h2>
        </Link>
        <p className="text-slate-500 text-base pl-6 mb-10">Tủ sách kinh điển, bài báo khoa học và báo cáo R&D cốt lõi. (Bấm vào tiêu đề để xem tất cả)</p>
        {renderCards(foundationalArticles, 'foundational', <BookOpen size={14} className="text-cyan-500"/>, "text-cyan-600")}
      </section>

      {/* 2. Semiconductor News */}
      <section id="semi-news" className="mb-24 scroll-mt-24">
        <Link to="/category/semi-news" className="inline-block group mb-2">
          <h2 className="font-serif text-3xl md:text-5xl text-blue-800 border-l-8 border-blue-500 pl-4 group-hover:text-blue-600 transition-colors flex items-center gap-4">
            Tin tức Bán dẫn <span className="text-xl opacity-0 group-hover:opacity-100 transition-opacity">&rarr;</span>
          </h2>
        </Link>
        <p className="text-slate-500 text-base pl-6 mb-10">Cập nhật chuỗi cung ứng toàn cầu và kiến trúc phần cứng vi mạch mới nhất.</p>
        {renderCards(semiNewsArticles, 'semi-news', <Cpu size={14} className="text-blue-500"/>, "text-blue-600")}
      </section>

      {/* 3. AI News */}
      <section id="ai-news" className="mb-12 scroll-mt-24">
        <Link to="/category/ai-news" className="inline-block group mb-2">
          <h2 className="font-serif text-3xl md:text-5xl text-rose-800 border-l-8 border-rose-500 pl-4 group-hover:text-rose-600 transition-colors flex items-center gap-4">
            Tin tức AI <span className="text-xl opacity-0 group-hover:opacity-100 transition-opacity">&rarr;</span>
          </h2>
        </Link>
        <p className="text-slate-500 text-base pl-6 mb-10">Đột phá về mô hình ngôn ngữ lớn (LLM), AGI và ứng dụng phần mềm.</p>
        {renderCards(aiNewsArticles, 'ai-news', <Sparkles size={14} className="text-rose-500"/>, "text-rose-600")}
      </section>

    </div>
  );
};

const Footer = () => (
  <footer className="py-12 text-center text-sm font-medium text-slate-400 bg-slate-50 border-t border-slate-200 relative">
    <p>&copy; 2026 NHỊP ĐẬP CÔNG NGHỆ. Nền tảng tri thức Bán dẫn & Trí tuệ Nhân tạo. All rights reserved.</p>
  </footer>
);

// --- Page Layouts --- //

const HomePage = ({ setShowSubscribeModal }: { setShowSubscribeModal: (s: boolean) => void }) => {
  const handleExploreClick = () => {
    const el = document.getElementById('foundational-docs');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Navbar setShowSubscribeModal={setShowSubscribeModal} />
      <Hero onExploreClick={handleExploreClick} />
      <ContentSections />
      <Footer />
    </>
  );
};

function App() {
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);

  return (
    <AuthProvider>
      <ToastProvider>
        <ConfirmProvider>
          <BrowserRouter>
            <ScrollRestorationHelper />
            <div className="min-h-screen font-sans selection:bg-cyan-200 selection:text-slate-900 bg-slate-50 text-slate-800">
              <SubscribeModal showSubscribeModal={showSubscribeModal} setShowSubscribeModal={setShowSubscribeModal} />
              
              <Routes>
                <Route path="/" element={<HomePage setShowSubscribeModal={setShowSubscribeModal} />} />
                <Route path="/article/:id" element={<ArticlePage />} />
                <Route path="/category/:id" element={<CategoryPage />} />
                <Route path="/community" element={<CommunityPage />} />
                <Route path="/admin" element={<AdminDashboard />} />
              </Routes>
            </div>
          </BrowserRouter>
        </ConfirmProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
