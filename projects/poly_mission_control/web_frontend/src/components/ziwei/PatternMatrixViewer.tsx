// web_frontend/src/components/ziwei/PatternMatrixViewer.tsx - Orthodox Patterns Matrix & Visualizer (<= 250 lines)
import { FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';
import { PATTERN_REGISTRY, MatchedPattern } from './patternTypes';

interface PatternMatrixViewerProps {
  astrolabe: {
    patterns?: MatchedPattern[];
    raw?: any;
    birthYearStem?: string;
  };
}

export const PatternMatrixViewer: FunctionalComponent<PatternMatrixViewerProps> = ({ astrolabe }) => {
  const [filterType, setFilterType] = useState<'all' | 'active' | 'auspicious' | 'inauspicious' | 'mixed'>('all');
  const [search, setSearch] = useState('');
  const activePatterns = astrolabe.patterns || [];
  const activeIds = new Set(activePatterns.map(p => p.id));

  const allPatterns = Object.values(PATTERN_REGISTRY);

  const filteredPatterns = allPatterns.filter(p => {
    if (filterType === 'active' && !activeIds.has(p.id)) return false;
    if (filterType === 'auspicious' && p.type !== 'auspicious') return false;
    if (filterType === 'inauspicious' && p.type !== 'inauspicious') return false;
    if (filterType === 'mixed' && p.type !== 'mixed') return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.name.includes(q) || p.brief.includes(q) || p.description.includes(q) || p.action.includes(q);
    }
    return true;
  });

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'auspicious':
        return 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300';
      case 'inauspicious':
        return 'bg-rose-950/80 border-rose-500/40 text-rose-300';
      default:
        return 'bg-sky-950/80 border-sky-500/40 text-sky-300';
    }
  };

  const getCardBorder = (type: string, isActive: boolean) => {
    if (!isActive) return 'border-gray-800 bg-[#0c101d]/60 opacity-70';
    switch (type) {
      case 'auspicious':
        return 'border-emerald-600/60 bg-emerald-950/20 shadow-lg shadow-emerald-950/30';
      case 'inauspicious':
        return 'border-rose-600/60 bg-rose-950/20 shadow-lg shadow-rose-950/30';
      default:
        return 'border-sky-600/60 bg-sky-950/20 shadow-lg shadow-sky-950/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* 顶部已命中格局看板 */}
      <div className="bg-[#0b101b] border border-amber-900/40 p-5 rounded-2xl space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
            <h3 className="text-base font-bold text-amber-200 tracking-wide">
              本盘已命中经典格局判定 ({activePatterns.length} 个)
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-amber-950/80 border border-amber-500/40 text-amber-300">
              0.1ms 确定性数学判定
            </span>
          </div>
          <span className="text-xs text-gray-400">
            遵循三方四正拱照、星系庙旺与干支生克，事实树强引用依归
          </span>
        </div>

        {activePatterns.length === 0 ? (
          <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/40 text-center text-xs text-gray-400">
            本盘未触发极端大吉或大凶格局，属于三方清纯、稳步开创之正格。
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activePatterns.map(p => (
              <div key={p.id} className={`p-4 rounded-xl border transition-all ${getCardBorder(p.type, true)}`}>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-100">{p.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono border ${getBadgeStyle(p.type)}`}>
                      {p.type === 'auspicious' ? '大吉格' : p.type === 'inauspicious' ? '凶局/防险' : '特格/自适应'}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-amber-300/80">落【{p.branch}】宫</span>
                </div>

                <div className="text-xs text-gray-300 mb-2 leading-relaxed">
                  <span className="text-gray-400 font-semibold">先验特征: </span>{p.brief}
                </div>

                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {p.keyStars.map((s, i) => (
                    <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-gray-800 border border-gray-700 text-amber-200">
                      {s}
                    </span>
                  ))}
                </div>

                <div className="p-2.5 rounded-lg bg-black/40 border border-gray-800/80 text-xs text-amber-200/90 leading-relaxed">
                  <strong className="text-amber-400">破局行动指南: </strong>{p.action}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 下方正统格局总览矩阵 */}
      <div className="bg-[#0b101b] border border-gray-800 p-5 rounded-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-gray-200 flex items-center gap-2">
              <span>正统格局全息知识库检视矩阵</span>
              <span className="text-xs text-gray-400 font-normal">
                (已录入 {allPatterns.length} 格局 · 已激活 {activePatterns.length})
              </span>
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">
              透视全部正统格局的数学条件与现代商业转译，便于发现可扩展优化的新格局。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="搜索格局名称 / 动作..."
              value={search}
              onInput={(e: any) => setSearch(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-200 w-44 placeholder:text-gray-500 focus:outline-none focus:border-amber-500"
            />
            <div className="flex rounded-lg overflow-hidden border border-gray-700 text-xs font-mono">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 ${filterType === 'all' ? 'bg-amber-600 text-white font-bold' : 'bg-gray-800 text-gray-300'}`}
              >
                全部
              </button>
              <button
                onClick={() => setFilterType('active')}
                className={`px-2.5 py-1 ${filterType === 'active' ? 'bg-amber-600 text-white font-bold' : 'bg-gray-800 text-gray-300'}`}
              >
                已命中({activePatterns.length})
              </button>
              <button
                onClick={() => setFilterType('auspicious')}
                className={`px-2.5 py-1 ${filterType === 'auspicious' ? 'bg-emerald-700 text-white font-bold' : 'bg-gray-800 text-gray-300'}`}
              >
                吉格
              </button>
              <button
                onClick={() => setFilterType('inauspicious')}
                className={`px-2.5 py-1 ${filterType === 'inauspicious' ? 'bg-rose-700 text-white font-bold' : 'bg-gray-800 text-gray-300'}`}
              >
                凶局
              </button>
              <button
                onClick={() => setFilterType('mixed')}
                className={`px-2.5 py-1 ${filterType === 'mixed' ? 'bg-sky-700 text-white font-bold' : 'bg-gray-800 text-gray-300'}`}
              >
                特格
              </button>
            </div>
          </div>
        </div>

        {/* 格局卡片列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredPatterns.map(p => {
            const isActive = activeIds.has(p.id);
            return (
              <div key={p.id} className={`p-3.5 rounded-xl border text-xs space-y-2 transition ${getCardBorder(p.type, isActive)}`}>
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-gray-200">{p.name}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono border ${getBadgeStyle(p.type)}`}>
                      {p.type === 'auspicious' ? '吉格' : p.type === 'inauspicious' ? '凶局' : '特格'}
                    </span>
                  </div>
                  {isActive ? (
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                      本盘已命中
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-400">未激活</span>
                  )}
                </div>

                <p className="text-gray-400 leading-relaxed text-[11px]">{p.description}</p>
                <div className="p-2 rounded bg-black/30 border border-gray-800/60 text-[11px] text-gray-300">
                  <span className="text-amber-400 font-semibold">现代破局: </span>{p.action}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
