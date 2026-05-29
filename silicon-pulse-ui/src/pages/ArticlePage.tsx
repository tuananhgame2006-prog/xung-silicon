import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { mockArticles } from '../data/mockArticles';
import { ArrowLeft, Clock, Download, Share2, Bookmark, CheckCircle2, ChevronRight, Cpu, Focus, Zap, X } from 'lucide-react';
import { useToast } from '../components/ToastContext';
import { useAuth } from '../components/AuthContext';
import { useConfirm } from '../components/ConfirmContext';
import { seoBridge } from '../api/seoBridge';
import DOMPurify from 'dompurify';
export const ArticlePage = () => {
  const { id } = useParams<{ id: string }>();
  const article = mockArticles.find(a => a.id === id);
  
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeHeading, setActiveHeading] = useState<string>('');
  const [headings, setHeadings] = useState<{id: string, title: string}[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // Breakthrough States
  const [isZenMode, setIsZenMode] = useState(false);
  const [isBionic, setIsBionic] = useState(false);

  const { showToast } = useToast();
  const { confirmAction } = useConfirm();
  const { isAdmin, token } = useAuth();
  const navigate = useNavigate();

  const handleDeleteArticle = async () => {
    if (!token || !article) return;
    confirmAction('Hành động này sẽ xóa vĩnh viễn bài viết. Bạn có chắc chắn?', async () => {
      try {
        await seoBridge.deleteArticle(article.id, token);
        showToast('Đã xóa bài viết thành công!');
        navigate('/');
      } catch {
        showToast('Xóa thất bại (hoặc dữ liệu ảo).');
      }
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight === 0) return;
      setScrollProgress((totalScroll / windowHeight) * 100);

      const headingElements = Array.from(document.querySelectorAll('#article-content h2[id]'));
      let current = '';
      for (const el of headingElements) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 300) {
          current = el.id;
        }
      }
      if (current) setActiveHeading(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [id]);

  // Pre-process HTML content for Bionic Reading and IDs safely in memory
  const processedHtml = React.useMemo(() => {
    if (!article) return '';
    const parser = new DOMParser();
    const doc = parser.parseFromString(article.content, 'text/html');

    // Auto-assign IDs to h2 for TOC linking if missing
    let idx = 0;
    const h2s = doc.querySelectorAll('h2');
    h2s.forEach(h2 => {
      if (!h2.id) {
        h2.id = `heading-${idx++}`;
      }
    });

    // Apply Bionic Reading
    if (isBionic) {
      const walk = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null);
      const nodes = [];
      let n;
      while ((n = walk.nextNode())) nodes.push(n);

      nodes.forEach(node => {
        if (!node.nodeValue || node.nodeValue.trim() === '') return;
        const parent = node.parentNode as HTMLElement;
        // Don't bold inside figcaption or h2
        if (parent && (parent.tagName === 'FIGCAPTION' || parent.tagName === 'H2')) return;

        // Fix Unicode combining characters issue
        const normalizedText = node.nodeValue.normalize('NFC');
        const words = normalizedText.split(/(\s+)/);
        const span = doc.createElement('span');
        words.forEach(word => {
          if (word.trim().length > 0) {
            const mid = Math.ceil(word.length / 2);
            const b = doc.createElement('b');
            b.className = isZenMode ? "font-black text-cyan-400 drop-shadow-md" : "font-black text-slate-900 drop-shadow-sm";
            b.textContent = word.slice(0, mid);
            span.appendChild(b);
            span.appendChild(doc.createTextNode(word.slice(mid)));
          } else {
            span.appendChild(doc.createTextNode(word));
          }
        });
        node.parentNode?.replaceChild(span, node);
      });
    }

    return doc.body.innerHTML;
  }, [article, isBionic, isZenMode]);

  // Extract headings for TOC
  useEffect(() => {
    if (article) {
      const parser = new DOMParser();
      // Parse from the processedHtml so we get the correctly assigned IDs
      const doc = parser.parseFromString(processedHtml, 'text/html');
      const h2s = Array.from(doc.querySelectorAll('h2')).map((h2, idx) => {
        const id = h2.id || `heading-${idx}`;
        return { id, title: h2.textContent || '' };
      });
      setHeadings(h2s);
    }
  }, [article, processedHtml]);

  // Apply Scroll Reveal safely using IntersectionObserver without modifying innerHTML
  useEffect(() => {
    if (!article) return;
    const container = document.getElementById('article-content');
    if (!container) return;

    const elements = container.querySelectorAll('p, h2, figure');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-12');
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -50px 0px' });

    elements.forEach(el => {
      el.classList.add('opacity-0', 'translate-y-12', 'transition-all', 'duration-[1200ms]', 'ease-out');
      observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [processedHtml]);

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-3xl font-serif mb-4">Không tìm thấy bài viết</h1>
          <Link to="/" className="text-cyan-600 hover:underline">Về Trang chủ</Link>
        </div>
      </div>
    );
  }

  const scrollToHeading = (e: React.MouseEvent<HTMLAnchorElement>, hid: string) => {
    e.preventDefault();
    const el = document.getElementById(hid);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    showToast('Đang chuẩn bị tệp PDF để tải xuống...');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Đã sao chép liên kết bài viết!');
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    if (!isBookmarked) {
      showToast('Đã lưu bài viết vào mục Yêu thích!');
    }
  };

  return (
    <div className={`min-h-screen font-sans pb-32 transition-colors duration-1000 ${isZenMode ? 'bg-slate-950 text-slate-300' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 z-50 transition-all duration-150" style={{ width: `${scrollProgress}%` }} />
      
      {/* Mini Header Nav */}
      <nav className={`print:hidden sticky top-0 z-40 border-b shadow-sm transition-all duration-500 ${isZenMode ? 'bg-slate-950/80 border-slate-800 backdrop-blur-xl' : 'bg-white/90 border-slate-200 backdrop-blur-md'}`}>
        <div className="max-w-[95rem] mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className={`${isZenMode ? 'text-slate-400 hover:text-cyan-400' : 'text-slate-500 hover:text-cyan-600'} flex items-center gap-2 transition-colors text-sm font-medium`}>
            <ArrowLeft size={16} /> Quay lại
          </Link>
          
          {/* Breakthrough Toggles */}
          <div className="flex items-center gap-4">
            {isAdmin && (
              <button 
                onClick={handleDeleteArticle}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-500 hover:text-white"
              >
                <X size={14} /> Xóa Bài Này
              </button>
            )}
            <button 
              onClick={() => setIsBionic(!isBionic)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${isBionic ? 'bg-cyan-500 text-white border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]' : isZenMode ? 'text-slate-400 border-slate-700 hover:text-cyan-400' : 'text-slate-500 border-slate-300 hover:text-cyan-600'}`}
            >
              <Zap size={14} className={isBionic ? 'fill-current' : ''} /> Bionic
            </button>
            <button 
              onClick={() => setIsZenMode(!isZenMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${isZenMode ? 'bg-purple-600 text-white border-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.5)]' : 'text-slate-500 border-slate-300 hover:text-purple-600'}`}
            >
              <Focus size={14} className={isZenMode ? 'fill-current' : ''} /> Zen Mode
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Cover Banner */}
      <div className={`w-full pt-20 pb-28 bg-gradient-to-br ${article.coverGradient} relative flex items-center justify-center overflow-hidden transition-all duration-1000 ${isZenMode ? 'opacity-80' : ''}`}>
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
        {isZenMode && <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>}
        
        <div className="relative z-10 max-w-5xl w-full px-6 text-center transform transition-transform duration-1000 hover:scale-[1.02]">
          <div className="flex items-center justify-center gap-2 mb-6 flex-wrap print:hidden">
            {article.tags.map(tag => (
              <Link to={`/?tag=${tag}`} key={tag} className="px-4 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-semibold uppercase tracking-wider rounded-full border border-white/20 shadow-sm transition-colors cursor-pointer">
                {tag}
              </Link>
            ))}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif text-white leading-[1.1] drop-shadow-2xl mb-6 max-w-4xl mx-auto">
            {article.title}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-serif italic max-w-3xl mx-auto drop-shadow-md border-t border-white/20 pt-6">
            "{article.excerpt}"
          </p>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className={`max-w-[95rem] mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 transition-all duration-1000`}>
        
        {/* Left Sidebar */}
        <aside className={`hidden lg:block lg:col-span-2 transition-all duration-700 print:hidden ${isZenMode ? 'opacity-0 -translate-x-10 pointer-events-none absolute' : 'opacity-100 relative'}`}>
          <div className="sticky top-28">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-full mb-4 flex items-center justify-center text-white font-serif text-2xl shadow-inner">
                {article.author.charAt(0)}
              </div>
              <h3 className="font-bold text-slate-900 mb-1">{article.author}</h3>
              <p className="text-sm text-slate-500 mb-4 font-medium">{article.authorRole}</p>
              <div className="h-px bg-slate-100 w-full mb-4"></div>
              <div className="flex flex-col gap-2 text-xs text-slate-400 uppercase tracking-wide font-bold">
                <span className="flex items-center gap-2"><Clock size={14} className="text-cyan-500"/> {article.readTime}</span>
                <span className="flex items-center gap-2 text-slate-400"><span className="w-3 h-3 rounded-full bg-slate-200 inline-block mr-0.5"></span> {article.date}</span>
              </div>
            </div>

            {article.downloadPdf && (
              <a href={article.downloadPdf} onClick={handleDownload} className="w-full flex items-center justify-between group bg-slate-900 text-white py-3.5 px-5 rounded-xl font-medium hover:bg-slate-800 transition-all shadow-lg mb-6">
                <span className="flex items-center gap-2"><Download size={18} className="text-cyan-400" /> Tải PDF</span>
                <ChevronRight size={18} className="text-slate-500 group-hover:text-white" />
              </a>
            )}

            <div className="flex items-center gap-3">
              <button onClick={handleShare} className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 text-sm font-semibold shadow-sm">
                <Share2 size={16} /> Chia sẻ
              </button>
              <button onClick={toggleBookmark} className={`w-12 h-[42px] flex items-center justify-center border rounded-xl shadow-sm ${isBookmarked ? 'bg-cyan-50 border-cyan-200 text-cyan-600' : 'bg-white border-slate-200 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50'}`}>
                <Bookmark size={18} className={isBookmarked ? "fill-current" : ""} />
              </button>
            </div>
          </div>
        </aside>

        {/* Center: Article Body */}
        <main className={`${isZenMode ? 'lg:col-span-12 max-w-5xl mx-auto' : 'lg:col-span-8 print:col-span-12 print:max-w-none print:shadow-none print:border-none print:p-0 print:mt-0'} transition-all duration-700 ${isZenMode ? 'bg-slate-900/50 backdrop-blur-3xl text-slate-300 border-slate-800' : 'bg-white text-slate-800 border-slate-200/60'} p-8 md:p-12 lg:p-16 rounded-[2rem] border shadow-2xl shadow-slate-900/10 -mt-24 relative z-20`}>
          <div 
            id="article-content"
            className={`prose prose-lg md:prose-xl max-w-none transition-colors duration-1000
              ${isZenMode ? 'prose-invert prose-headings:text-slate-100 prose-p:text-slate-300 prose-blockquote:bg-slate-800/50 prose-blockquote:border-cyan-400 prose-blockquote:text-slate-200 prose-strong:text-cyan-400 prose-figcaption:text-slate-500' : 'prose-slate prose-headings:text-slate-900 prose-p:text-slate-700 prose-blockquote:bg-cyan-50/40 prose-blockquote:border-cyan-500 prose-blockquote:text-slate-800 prose-strong:text-cyan-800 prose-figcaption:text-slate-500'}
              prose-headings:font-sans prose-headings:font-normal
              prose-h2:text-3xl md:prose-h2:text-4xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:pb-4 prose-h2:border-b
              prose-p:leading-loose prose-p:mb-8
              prose-blockquote:border-l-4 prose-blockquote:py-6 prose-blockquote:px-8 prose-blockquote:rounded-r-2xl prose-blockquote:font-serif prose-blockquote:text-2xl prose-blockquote:leading-snug prose-blockquote:italic prose-blockquote:my-10 prose-blockquote:shadow-sm
              prose-strong:font-semibold
            `}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(processedHtml) }}
          />
        </main>

        {/* Right Sidebar */}
        <aside className={`hidden lg:block lg:col-span-2 transition-all duration-700 print:hidden ${isZenMode ? 'opacity-0 translate-x-10 pointer-events-none absolute' : 'opacity-100 relative'}`}>
          <div className="sticky top-28">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
               <CheckCircle2 size={16} className="text-cyan-500"/> Nội dung chính
            </h4>
            
            {headings.length > 0 ? (
              <div className="relative border-l-2 border-slate-100 pl-4 space-y-1">
                {/* Dynamic Orb Tracker */}
                <div 
                  className="absolute left-[-5px] w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)] transition-all duration-500 ease-out"
                  style={{
                    top: `${Math.max(0, headings.findIndex(h => h.id === activeHeading)) * 36}px`,
                    marginTop: '8px'
                  }}
                />
                
                {headings.map(h => (
                  <a 
                    key={h.id}
                    href={`#${h.id}`}
                    onClick={(e) => scrollToHeading(e, h.id)}
                    className={`block py-1.5 text-sm transition-all duration-200 ${
                      activeHeading === h.id 
                        ? 'text-cyan-700 font-bold translate-x-2' 
                        : 'text-slate-500 hover:text-slate-800 hover:translate-x-1'
                    }`}
                  >
                    {h.title}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">Bài viết không có mục lục.</p>
            )}
            
            <Link to="/community" className="block mt-12 p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-center relative overflow-hidden group shadow-xl hover:shadow-cyan-500/20 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl group-hover:bg-cyan-500/40 transition-colors duration-500"></div>
              <Cpu className="text-cyan-400 w-10 h-10 mx-auto mb-4 relative z-10 group-hover:scale-110 transition-transform" />
              <h4 className="text-white font-serif text-xl mb-2 relative z-10">Cộng đồng Xung Silicon</h4>
              <p className="text-slate-400 text-xs mb-4 relative z-10">Đăng ký trở thành thành viên để cùng thảo luận chuyên sâu.</p>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 group-hover:text-cyan-300 relative z-10">Đăng ký thành viên &rarr;</span>
            </Link>
          </div>
        </aside>

      </div>

      {/* Related Articles (Hidden in Print & Zen Mode) */}
      {!isZenMode && (
        <div className="max-w-[95rem] mx-auto px-6 mt-20 pt-16 border-t border-slate-200 print:hidden">
          <h3 className="text-2xl font-serif text-slate-900 mb-8 flex items-center gap-2">
            <Bookmark className="text-cyan-500" /> Có thể bạn sẽ thích
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockArticles.filter(a => a.id !== article.id).slice(0, 3).map(related => (
              <Link to={`/article/${related.id}`} key={related.id} className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all">
                <div className={`h-32 w-full bg-gradient-to-br ${related.coverGradient} group-hover:scale-105 transition-transform duration-500`} />
                <div className="p-6 flex-1 flex flex-col">
                  <div className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider mb-2">{related.category}</div>
                  <h4 className="font-serif text-lg text-slate-900 mb-2 group-hover:text-cyan-600 transition-colors line-clamp-2">{related.title}</h4>
                  <div className="mt-auto flex items-center justify-between text-xs text-slate-500">
                    <span>{related.author}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {related.readTime}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
