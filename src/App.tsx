import React, { useEffect, useState, useRef } from 'react';
import { 
  Grid, 
  PieChart, 
  TrendingUp, 
  FileText, 
  RefreshCw,
  Calendar
} from 'lucide-react';
import { 
  Keyword, 
  Draft, 
  PublishedPost, 
  TrajectoryData, 
  LogEntry, 
  PipelineStats 
} from './types';

// Import modular premium enterprise components
import Sidebar from './components/Sidebar';
import MetricsBoard from './components/MetricsBoard';
import PipelineViewer from './components/PipelineViewer';
import QARadar from './components/QARadar';
import RankingTrajectory from './components/RankingTrajectory';
import HTMLPreviewer from './components/HTMLPreviewer';
import TerminalLog from './components/TerminalLog';
import EditorialPlanAndAlerts from './components/EditorialPlanAndAlerts';

export default function App() {
  // Input seed state
  const [seedTopic, setSeedTopic] = useState('tự động hóa nội dung trí tuệ nhân tạo');
  const [activeTab, setActiveTab] = useState(0); // 0: Pipeline, 1: QA Radar, 2: GSC, 3: HTML Preview
  
  // Pipeline database lists
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [published, setPublished] = useState<PublishedPost[]>([]);
  const [trajectory, setTrajectory] = useState<TrajectoryData[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<PipelineStats>({
    keywordsFound: 0,
    draftsPending: 0,
    postsPublished: 0,
    averageSeoScore: 0,
  });

  // UI status flags
  const [isLoading, setIsLoading] = useState(false);
  const [activeStage, setActiveStage] = useState<number | null>(null);
  const [selectedDraftId, setSelectedDraftId] = useState<string>('');
  const [activePreviewMode, setActivePreviewMode] = useState<'interactive' | 'source'>('interactive');
  const [logFilter, setLogFilter] = useState<string>('all');
  const [copySuccess, setCopySuccess] = useState(false);

  // Auto-scroll ref
  const logTerminalEndRef = useRef<HTMLDivElement>(null);

  // Sync index on first mount
  useEffect(() => {
    fetchPipelineData();
  }, []);

  // Smooth scroll for log streamer updates
  useEffect(() => {
    if (logTerminalEndRef.current) {
      logTerminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const fetchPipelineData = async () => {
    try {
      const res = await fetch('/api/pipeline');
      if (res.ok) {
        const data = await res.json();
        setKeywords(data.keywords || []);
        setDrafts(data.drafts || []);
        setPublished(data.published || []);
        setTrajectory(data.trajectory || []);
        setLogs(data.logs || []);
        setStats(data.metrics || {
          keywordsFound: 0,
          draftsPending: 0,
          postsPublished: 0,
          averageSeoScore: 0,
        });

        // Set default dynamic selected draft
        if (data.drafts && data.drafts.length > 0 && !selectedDraftId) {
          setSelectedDraftId(data.drafts[data.drafts.length - 1].id);
        }
      }
    } catch (err) {
      console.error('Lỗi nạp dữ liệu từ máy chủ API:', err);
    }
  };

  const runStage = async (stageNum: number, forceKeywordId?: string, forceDraftId?: string) => {
    if (isLoading) return;
    setIsLoading(true);
    setActiveStage(stageNum);

    let bodyPayload: any = { stage: stageNum };
    if (stageNum === 1) {
      bodyPayload.seedTopic = seedTopic;
    } else if (stageNum === 2) {
      bodyPayload.keywordId = forceKeywordId || undefined;
    } else if (stageNum === 3) {
      bodyPayload.draftId = forceDraftId || undefined;
    } else if (stageNum === 4) {
      bodyPayload.draftId = forceDraftId || undefined;
    }

    try {
      const res = await fetch('/api/pipeline/run-stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      const result = await res.json();
      if (!res.ok) {
        console.error('Xử lý Giai đoạn lỗi:', result.error);
      } else {
        // Auto routing helpful visual layout tab
        if (stageNum === 1) {
          setActiveTab(0); // See keywords list
        } else if (stageNum === 2) {
          if (result.draft) {
            setSelectedDraftId(result.draft.id);
          }
          setActiveTab(3); // Inspect newly drafted HTML Content
        } else if (stageNum === 3) {
          if (result.draft) {
            setSelectedDraftId(result.draft.id);
          }
          setActiveTab(1); // Inspect radar performance audit score
        } else if (stageNum === 4) {
          setActiveTab(0); // See published link indexes
        } else if (stageNum === 5) {
          setActiveTab(2); // See Search Console progression graph
        }
      }
    } catch (err) {
      console.error('Lỗi mạng truyền tải tác vụ:', err);
    } finally {
      setIsLoading(false);
      setActiveStage(null);
      await fetchPipelineData();
    }
  };

  const resetDatabase = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ Dữ liệu Tiến trình và lịch sử GSC trong SQLite không?')) {
      try {
        const res = await fetch('/api/pipeline/reset', { method: 'POST' });
        if (res.ok) {
          setSelectedDraftId('');
          await fetchPipelineData();
        }
      } catch (err) {
        console.error('Lỗi khi thiết lập lại CSDL:', err);
      }
    }
  };

  const updateDraft = async (payload: {
    draftId: string;
    approvalStatus?: 'pending' | 'approved' | 'rejected';
    editorFeedback?: string;
    scheduledDate?: string;
    assignedAgent?: string;
  }) => {
    try {
      const res = await fetch('/api/pipeline/update-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await fetchPipelineData();
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật thông tin bài viết:', err);
    }
  };

  const activeDraft = drafts.find(d => d.id === selectedDraftId) || drafts[drafts.length - 1];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const filteredLogs = logs.filter(entry => {
    if (logFilter === 'all') return true;
    return entry.agent.toLowerCase() === logFilter.toLowerCase();
  });

  // Radar helper functions
  const getRadarSVGCoordinates = (attrs: any) => {
    if (!attrs) return '';
    const metricsMap = [
      attrs.readability || 0,
      attrs.keywordDensity || 0,
      attrs.wordCountScore || 0,
      attrs.structure || 0,
      attrs.metadata || 0,
      attrs.backlinkPotential || 0
    ];

    const centerX = 190;
    const centerY = 190;
    const maxRadius = 115;

    const coordinates = metricsMap.map((val, i) => {
      const angle = i * (Math.PI / 3) - Math.PI / 2;
      const radius = (val / 100) * maxRadius;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      return `${x},${y}`;
    });

    return coordinates.join(' ');
  };

  // Trajectory Math Helpers
  const maxImpressions = Math.max(...trajectory.map(t => t.impressions), 5000);
  const maxClicks = Math.max(...trajectory.map(t => t.clicks), 300);

  const getImpressionsSVGPoints = () => {
    if (trajectory.length === 0) return '';
    const points = trajectory.map((t, idx) => {
      const x = 55 + (idx / (trajectory.length - 1)) * 610;
      const y = 200 - (t.impressions / maxImpressions) * 150;
      return `${x},${y}`;
    });
    return points.join(' ');
  };

  const getClicksSVGPoints = () => {
    if (trajectory.length === 0) return '';
    const points = trajectory.map((t, idx) => {
      const x = 55 + (idx / (trajectory.length - 1)) * 610;
      const y = 200 - (t.clicks / maxClicks) * 150;
      return `${x},${y}`;
    });
    return points.join(' ');
  };

  const getPositionSVGPoints = () => {
    if (trajectory.length === 0) return '';
    const points = trajectory.map((t, idx) => {
      const x = 55 + (idx / (trajectory.length - 1)) * 610;
      const y = 50 + ((t.position - 1) / 99) * 150;
      return `${x},${y}`;
    });
    return points.join(' ');
  };

  return (
    <div className="flex h-screen w-full bg-slate-100 text-slate-800 font-sans overflow-hidden selection:bg-blue-200/50 selection:text-slate-900">

      {/* Sidebar navigation */}
      <Sidebar 
        seedTopic={seedTopic}
        setSeedTopic={setSeedTopic}
        isLoading={isLoading}
        activeStage={activeStage}
        keywords={keywords}
        drafts={drafts}
        published={published}
        trajectory={trajectory}
        runStage={runStage}
        resetDatabase={resetDatabase}
      />

      {/* Main Container Area */}
      <main className="flex-grow flex flex-col justify-between overflow-hidden min-w-0 bg-slate-50">

        {/* Counter cards board */}
        <MetricsBoard stats={stats} />

        {/* Dynamic workspace container */}
        <div className="flex-1 px-5 py-4 flex flex-col min-h-0 container mx-auto max-w-7xl">
          
          {/* Tab Selection Header Bar */}
          <div className="flex space-x-1 border-b border-slate-200 shrink-0 mb-4">
            <button 
              onClick={() => setActiveTab(0)}
              className={`px-4 py-2.5 text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 border-b-2 -mb-px ${
                activeTab === 0 
                  ? 'text-blue-600 border-blue-600 bg-blue-50/50' 
                  : 'text-slate-500 border-transparent hover:text-slate-800'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Tiến trình Swarm</span>
            </button>

            <button 
              onClick={() => setActiveTab(1)}
              className={`px-4 py-2.5 text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 border-b-2 -mb-px ${
                activeTab === 1 
                  ? 'text-blue-600 border-blue-600 bg-blue-50/50' 
                  : 'text-slate-500 border-transparent hover:text-slate-800'
              }`}
            >
              <PieChart className="w-3.5 h-3.5" />
              <span>Radar Kiểm duyệt</span>
            </button>

            <button 
              onClick={() => setActiveTab(2)}
              className={`px-4 py-2.5 text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 border-b-2 -mb-px ${
                activeTab === 2 
                  ? 'text-blue-600 border-blue-600 bg-blue-50/50' 
                  : 'text-slate-500 border-transparent hover:text-slate-800'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Biểu đồ Tăng trưởng</span>
            </button>

            <button 
              onClick={() => setActiveTab(3)}
              className={`px-4 py-2.5 text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 border-b-2 -mb-px ${
                activeTab === 3 
                  ? 'text-blue-600 border-blue-600 bg-blue-50/50' 
                  : 'text-slate-500 border-transparent hover:text-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Xem trước bản thảo</span>
            </button>

            <button 
              onClick={() => setActiveTab(4)}
              className={`px-4 py-2.5 text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 border-b-2 -mb-px ${
                activeTab === 4 
                  ? 'text-blue-600 border-blue-600 bg-blue-50/50' 
                  : 'text-slate-500 border-transparent hover:text-slate-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Lịch đăng & Cảnh báo</span>
            </button>

            {isLoading && (
              <div className="ml-auto px-3 py-1 self-center text-[10px] rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5 animate-pulse font-bold">
                <RefreshCw className="w-3 h-3 animate-spin text-blue-650" />
                <span>Swarm Đang Thực Thi</span>
              </div>
            )}
          </div>

          {/* Tab content Router renders with overflow-y scroll */}
          <div className="flex-grow py-1 min-h-0 overflow-y-auto">
            {activeTab === 0 && (
              <PipelineViewer 
                keywords={keywords}
                drafts={drafts}
                published={published}
                isLoading={isLoading}
                runStage={runStage}
                setSelectedDraftId={setSelectedDraftId}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 1 && (
              <QARadar 
                activeDraft={activeDraft}
                drafts={drafts}
                selectedDraftId={selectedDraftId}
                setSelectedDraftId={setSelectedDraftId}
                getRadarSVGCoordinates={getRadarSVGCoordinates}
              />
            )}

            {activeTab === 2 && (
              <RankingTrajectory 
                trajectory={trajectory}
                maxImpressions={maxImpressions}
                maxClicks={maxClicks}
                getImpressionsSVGPoints={getImpressionsSVGPoints}
                getClicksSVGPoints={getClicksSVGPoints}
                getPositionSVGPoints={getPositionSVGPoints}
              />
            )}

            {activeTab === 3 && (
              <HTMLPreviewer 
                drafts={drafts}
                selectedDraftId={selectedDraftId}
                setSelectedDraftId={setSelectedDraftId}
                activeDraft={activeDraft}
                activePreviewMode={activePreviewMode}
                setActivePreviewMode={setActivePreviewMode}
                copyToClipboard={copyToClipboard}
                copySuccess={copySuccess}
                onImageGenerated={fetchPipelineData}
              />
            )}

            {activeTab === 4 && (
              <EditorialPlanAndAlerts
                drafts={drafts}
                keywords={keywords}
                published={published}
                onUpdateDraft={updateDraft}
                isLoading={isLoading}
              />
            )}
          </div>

          {/* Sequential pipelines standard workflow brief caption info */}
          <div className="border-t border-slate-200 pt-3 mt-3.5 flex flex-col md:flex-row items-center justify-between text-[10px] text-slate-400 gap-1.5 shrink-0 font-sans font-semibold">
            <span>TOÀN BỘ CHU TRÌNH TỰ ĐỘNG KHÉP KÍN</span>
            <span className="text-blue-600 font-bold uppercase tracking-wider">
              Chuỗi phối hợp Swarm: Phân tích keyword → Viết nháp → Đánh giá SEO → Xuất bản CMS → Theo dõi GSC
            </span>
          </div>

        </div>

        {/* Real-time system console logs layout */}
        <TerminalLog 
          logs={logs}
          filteredLogs={filteredLogs}
          logFilter={logFilter}
          setLogFilter={setLogFilter}
          logTerminalEndRef={logTerminalEndRef}
        />

      </main>

    </div>
  );
}
