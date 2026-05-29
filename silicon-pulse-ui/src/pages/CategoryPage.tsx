import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Filter } from 'lucide-react';
import { mockArticles } from '../data/mockArticles';

const parseDate = (dateStr: string) => {
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

export const CategoryPage = () => {
  const { id } = useParams<{ id: string }>();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  
  const categoryTitles: Record<string, string> = {
    'foundational': 'Tài liệu Nền tảng',
    'semi-news': 'Tin tức Bán dẫn',
    'ai-news': 'Tin tức AI'
  };

  const title = categoryTitles[id || ''] || 'Danh mục';
  let articles = mockArticles.filter(a => a.category === id);

  articles = [...articles].sort((a, b) => parseDate(b.date) - parseDate(a.date));

  // Filtering for foundational
  if (id === 'foundational' && activeFilter !== 'all') {
    articles = articles.filter(a => a.type === activeFilter);
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-slate-500 hover:text-cyan-600 flex items-center gap-2 transition-colors text-sm font-medium">
            <ArrowLeft size={16} /> Về Trang chủ
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg tracking-wide text-slate-800">XUNG SILICON</span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-12">
        <div className="mb-10">
          <h1 className="font-serif text-4xl md:text-5xl text-slate-900 mb-4">{title}</h1>
          <p className="text-slate-500 text-lg mb-8">Khám phá tất cả các bài viết, tin tức và báo cáo chuyên sâu nhất thuộc chuyên mục này.</p>
          
          {/* Sub-filters for Foundational */}
          {id === 'foundational' && (
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setActiveFilter('all')} className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${activeFilter === 'all' ? 'bg-cyan-100 text-cyan-800 border-2 border-cyan-200' : 'bg-white text-slate-500 border-2 border-slate-200 hover:border-cyan-200'}`}>Tất cả</button>
              <button onClick={() => setActiveFilter('book')} className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${activeFilter === 'book' ? 'bg-cyan-100 text-cyan-800 border-2 border-cyan-200' : 'bg-white text-slate-500 border-2 border-slate-200 hover:border-cyan-200'}`}>Sách</button>
              <button onClick={() => setActiveFilter('paper')} className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${activeFilter === 'paper' ? 'bg-cyan-100 text-cyan-800 border-2 border-cyan-200' : 'bg-white text-slate-500 border-2 border-slate-200 hover:border-cyan-200'}`}>Báo cáo khoa học / IEEE</button>
              <button onClick={() => setActiveFilter('research')} className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${activeFilter === 'research' ? 'bg-cyan-100 text-cyan-800 border-2 border-cyan-200' : 'bg-white text-slate-500 border-2 border-slate-200 hover:border-cyan-200'}`}>Nghiên cứu & R&D</button>
            </div>
          )}

          {/* Timeline header for News */}
          {(id === 'semi-news' || id === 'ai-news') && (
            <div className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-wide text-sm border-b border-slate-200 pb-2">
              <Filter size={16} /> Dòng thời gian (Cập nhật liên tục 2026)
            </div>
          )}
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            Không tìm thấy bài viết nào trong chuyên mục này.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((doc) => (
              <Link to={`/article/${doc.id}`} key={doc.id} className="block h-full group">
                <div className="glass-panel p-0 rounded-[2rem] flex flex-col h-full cursor-pointer bg-white overflow-hidden border border-slate-200 hover:shadow-2xl hover:shadow-slate-300/50 transition-all duration-300">
                  <div className={`h-32 w-full bg-gradient-to-br ${doc.coverGradient} relative`}>
                     <div className="absolute top-4 left-4 flex gap-2">
                       <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-bold uppercase tracking-wider border border-white/30">
                         {doc.type === 'book' ? 'Sách' : doc.type === 'paper' ? 'Báo cáo IEEE' : doc.type === 'research' ? 'R&D Kỹ thuật' : 'Phân tích'}
                       </div>
                       {doc.tags.find(tag => tag.startsWith('Thời kỳ') || tag.startsWith('Tháng')) && (
                         <div className="bg-cyan-500/80 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-bold uppercase tracking-wider border border-cyan-400/50 shadow-sm">
                           {doc.tags.find(tag => tag.startsWith('Thời kỳ') || tag.startsWith('Tháng'))}
                         </div>
                       )}
                     </div>
                     <div className="absolute top-4 right-4 flex gap-2">
                       {doc.date.includes(' - ') ? (
                         <div className="bg-rose-500/90 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-bold tracking-wider border border-rose-400/50 shadow-lg">
                           {doc.date.split(' - ')[0]}
                         </div>
                       ) : (
                         <div className="bg-emerald-500/90 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-bold tracking-wider border border-emerald-400/50 shadow-lg animate-pulse">
                           MỚI
                         </div>
                       )}
                     </div>
                  </div>
                  
                  <div className="p-8 flex flex-col flex-grow -mt-8 bg-white rounded-t-3xl relative z-10">
                    <h3 className="font-serif text-2xl mb-4 text-slate-900 group-hover:text-cyan-700 transition-colors leading-snug">{doc.title}</h3>
                    <p className="text-sm text-slate-600 flex-grow leading-relaxed">{doc.excerpt}</p>
                    
                    <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-wide">
                        <Clock size={14} className="text-slate-400"/> {doc.readTime}
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">{doc.date.includes(' - ') ? doc.date.split(' - ')[1] : doc.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
