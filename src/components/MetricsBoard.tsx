/* Copyright (c) 2026 Tuấn Anh (tuananhgame2006). Tác phẩm được bảo hộ bản quyền. Nghiêm cấm sao chép dưới mọi hình thức. */
import React from 'react';
import { PipelineStats } from '../types';
import { Search, Edit3, Globe, Award } from 'lucide-react';

interface MetricsBoardProps {
  stats: PipelineStats;
}

export default function MetricsBoard({ stats }: MetricsBoardProps) {
  // Volume estimations
  const keywordPercent = Math.min((stats.keywordsFound / 20) * 100, 100);
  const draftsPercent = Math.min((stats.draftsPending / 10) * 100, 100);
  const postsPercent = Math.min((stats.postsPublished / 10) * 100, 100);
  const seoPercent = stats.averageSeoScore || 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-5 shrink-0 border-b border-slate-200 bg-slate-50/50">
      
      {/* Card 1: Keywords found */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-slate-350">
        <div className="flex justify-between items-start mb-1">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-sans">
            01. TỪ KHÓA ĐÃ QUÉT
          </p>
          <Search className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex items-baseline gap-1.5 mt-1.5">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{stats.keywordsFound}</h2>
          <span className="text-[10px] text-slate-400 font-medium">tổng số</span>
        </div>
        <div className="h-1 bg-slate-100 rounded-full mt-3 w-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 rounded-full transition-all duration-500" 
            style={{ width: `${keywordPercent}%` }} 
          />
        </div>
      </div>

      {/* Card 2: Drafts Pending */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-slate-350">
        <div className="flex justify-between items-start mb-1">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-sans">
            02. BẢN NHÁP CHỜ DUYỆT
          </p>
          <Edit3 className="w-4 h-4 text-amber-600" />
        </div>
        <div className="flex items-baseline gap-1.5 mt-1.5">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{stats.draftsPending}</h2>
          <span className="text-[10px] text-slate-400 font-medium">nội dung</span>
        </div>
        <div className="h-1 bg-slate-100 rounded-full mt-3 w-full overflow-hidden">
          <div 
            className="h-full bg-amber-500 rounded-full transition-all duration-500" 
            style={{ width: `${draftsPercent}%` }} 
          />
        </div>
      </div>

      {/* Card 3: CMS Index */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-slate-350">
        <div className="flex justify-between items-start mb-1">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-sans">
            03. ĐÃ XUẤT BẢN
          </p>
          <Globe className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="flex items-baseline gap-1.5 mt-1.5">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{stats.postsPublished}</h2>
          <span className="text-[10px] text-slate-400 font-medium">ở kênh CMS</span>
        </div>
        <div className="h-1 bg-slate-100 rounded-full mt-3 w-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
            style={{ width: `${postsPercent}%` }} 
          />
        </div>
      </div>

      {/* Card 4: Average Quality Score */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-slate-350">
        <div className="flex justify-between items-start mb-1">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">
            04. ĐIỂM SEO TRUNG BÌNH
          </p>
          <Award className="w-4 h-4 text-blue-500" />
        </div>
        <div className="flex items-baseline gap-1.5 mt-1.5">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {stats.averageSeoScore}%
          </h2>
          <span className="text-[10px] text-slate-400 font-medium">hiệu suất</span>
        </div>
        <div className="h-1 bg-slate-100 rounded-full mt-3 w-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 rounded-full transition-all duration-500" 
            style={{ width: `${seoPercent}%` }} 
          />
        </div>
      </div>

    </div>
  );
}
