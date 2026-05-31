/* Copyright (c) 2026 Tuấn Anh (tuananhgame2006). Tác phẩm được bảo hộ bản quyền. Nghiêm cấm sao chép dưới mọi hình thức. */
import React from 'react';
import { Terminal } from 'lucide-react';
import { LogEntry } from '../types';

interface TerminalLogProps {
  logs: LogEntry[];
  filteredLogs: LogEntry[];
  logFilter: string;
  setLogFilter: (filter: string) => void;
  logTerminalEndRef: React.RefObject<HTMLDivElement>;
}

export default function TerminalLog({
  logs,
  filteredLogs,
  logFilter,
  setLogFilter,
  logTerminalEndRef
}: TerminalLogProps) {
  return (
    <div className="p-5 pt-0 shrink-0 font-sans">
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        
        {/* Terminal Header Bar */}
        <div className="bg-slate-50 px-4 py-2.5 flex justify-between items-center border-b border-slate-200/80">
          <span className="text-[10px] font-mono font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-blue-650" />
            <span>Nhật ký Luồng Hệ thống (Log Terminal)</span>
          </span>
          <div className="flex space-x-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-205 border border-slate-300"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-slate-205 border border-slate-300"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-slate-205 border border-slate-300"></div>
          </div>
        </div>

        {/* Tab filters Bar */}
        <div className="bg-slate-50 border-b border-slate-200/80 px-4 py-2 flex flex-wrap items-center gap-2 text-[10px] font-mono">
          <button 
            onClick={() => setLogFilter('all')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer uppercase font-bold text-[9.5px] border ${
              logFilter === 'all' 
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                : 'text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            TẤT CẢ PHÂN HỆ
          </button>
          <button 
            onClick={() => setLogFilter('scout')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer uppercase font-bold text-[9.5px] border ${
              logFilter === 'scout' 
                ? 'bg-blue-650 text-white border-blue-650 shadow-sm' 
                : 'text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            TÌM KIẾM TỪ KHÓA
          </button>
          <button 
            onClick={() => setLogFilter('writer')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer uppercase font-bold text-[9.5px] border ${
              logFilter === 'writer' 
                ? 'bg-blue-650 text-white border-blue-650 shadow-sm' 
                : 'text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            BIÊN SOẠN BÀI
          </button>
          <button 
            onClick={() => setLogFilter('reviewer')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer uppercase font-bold text-[9.5px] border ${
              logFilter === 'reviewer' 
                ? 'bg-blue-650 text-white border-blue-650 shadow-sm' 
                : 'text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            ĐÁNH GIÁ SEO
          </button>
          <button 
            onClick={() => setLogFilter('publisher')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer uppercase font-bold text-[9.5px] border ${
              logFilter === 'publisher' 
                ? 'bg-blue-650 text-white border-blue-650 shadow-sm' 
                : 'text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            XUẤT BẢN APP
          </button>
          <button 
            onClick={() => setLogFilter('tracker')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer uppercase font-bold text-[9.5px] border ${
              logFilter === 'tracker' 
                ? 'bg-blue-650 text-white border-blue-650 shadow-sm' 
                : 'text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            THEO DÕI TRAFFIC
          </button>
        </div>

        {/* Scrollable log list */}
        <div className="h-28 overflow-y-auto bg-slate-50/50 p-4 font-mono text-xs space-y-1.5 flex flex-col scrollbar-thin">
          {filteredLogs.length === 0 ? (
            <p className="text-slate-400 italic font-medium">
              Hiện chưa ghi nhận tệp tin nhật ký. Kích hoạt Swarm Agent từ thanh tác vụ để hiển thị dữ liệu log.
            </p>
          ) : (
            filteredLogs.map(log => {
              const colorMap = {
                info: 'text-slate-500',
                success: 'text-emerald-700',
                warning: 'text-amber-700',
                error: 'text-rose-600'
              };

              return (
                <div key={log.id} className="flex items-start gap-2.5 leading-relaxed text-[11px] font-medium">
                  <span className="text-slate-400 font-normal shrink-0">
                    [{new Date(log.timestamp).toLocaleTimeString()}]
                  </span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-extrabold shrink-0 border ${
                    log.agent === 'Scout' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                    log.agent === 'Writer' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                    log.agent === 'Reviewer' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                    log.agent === 'Publisher' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                    'bg-slate-100 text-slate-600 border-slate-205'
                  }`}>
                    {log.agent}
                  </span>
                  <span className={`flex-grow font-mono ${colorMap[log.type]} font-semibold`}>
                    {log.message}
                  </span>
                </div>
              );
            })
          )}
          <div ref={logTerminalEndRef} />
        </div>

        {/* Footer info system status */}
        <div className="flex items-center justify-between text-[9px] font-mono text-slate-405 p-2.5 px-4 border-t border-slate-200/80 bg-slate-50">
          <span>KẾT NỐI AN TOÀN: SSL KÊNH TRUYỀN BẢO MẬT</span>
          <span>© SEO EMPIRE SWARM PIPELINE B2B • VIETNAMESE EDITION</span>
        </div>

      </div>
    </div>
  );
}
