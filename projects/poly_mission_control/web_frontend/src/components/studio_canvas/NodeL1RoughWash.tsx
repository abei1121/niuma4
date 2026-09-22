import { FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';
import { Handle, Position } from '@xyflow/react';
import { NodeL1Data } from './types';
import { L1SegmentsInspector } from './L1SegmentsInspector';

interface Props {
  data: NodeL1Data;
}

export const NodeL1RoughWash: FunctionalComponent<Props> = ({ data }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [compareMode, setCompareMode] = useState<'clean' | 'original'>('clean');
  const [autoSkip, setAutoSkip] = useState(true);
  const [playheadSec, setPlayheadSec] = useState(0);
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);

  const isWashing = data.status === 'washing';
  const hasCleanFile = Boolean(data.cleanFile);
  const isVertical = data.ratio === '9:16';
  const hasSegments = Boolean(data.keepSegments && data.keepSegments.length > 0);
  const totalDur = data.stats?.original_duration_sec || 90.0;
  const fileList = data.files && data.files.length > 0 ? data.files : [data.originalFile || ''];
  const activeFilePath = fileList[selectedFileIdx] || data.originalFile || data.cleanFile || '';

  const getMediaUrl = (path?: string) => {
    if (!path) return '';
    const name = path.split('/').pop() || '';
    if (path.includes('/library')) return `/media/library/${encodeURIComponent(name)}`;
    if (path.includes('/outputs')) return `/media/outputs/${encodeURIComponent(name)}`;
    return `/api/files/download?path=${encodeURIComponent(path)}`;
  };

  const currentVideoUrl = getMediaUrl(activeFilePath);
  const currentFileName = activeFilePath.split('/').pop() || '';
  const activeFileName = currentFileName;

  // 过滤出当前选中素材的切除停顿
  const currentFileCuts = data.cutSegments?.filter((c) => !c.source_file || c.source_file.includes(activeFileName)) || [];
  const activeCuts = currentFileCuts.length > 0 ? currentFileCuts : (data.cutSegments || []);

  const handleTimeUpdate = (e: any) => {
    const cur = e.currentTarget.currentTime;
    setPlayheadSec(cur);
    if (!autoSkip || compareMode === 'original' || !activeCuts.length) return;
    for (const cut of activeCuts) {
      if (cur >= cut.start && cur < cut.end - 0.05) {
        e.currentTarget.currentTime = cut.end;
        break;
      }
    }
  };

  return (
    <div className={`bg-[#0f172a]/95 border-2 border-emerald-500/50 rounded-xl p-4 shadow-xl shadow-emerald-950/40 text-gray-200 space-y-3 transition-all duration-200 ${isExpanded ? 'w-96' : 'w-88'}`}>
      <Handle type="target" position={Position.Left} className="!bg-emerald-400 !w-3 !h-3" />

      <div className="flex items-center justify-between pb-2 border-b border-gray-800 cursor-grab active:cursor-grabbing select-none">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">L1</span>
          <span className="font-bold text-sm text-gray-100">多段素材粗剪去静音</span>
        </div>
        <span className="text-[10px] text-emerald-400 font-mono">{isVertical ? '9:16 竖屏' : '16:9 横屏'}</span>
      </div>

      {/* 多素材切换标签条 */}
      {fileList.length > 1 && (
        <div className="flex space-x-1 pb-1 overflow-x-auto text-[9px] font-mono select-none">
          {fileList.map((f, i) => (
            <button key={f} onClick={() => setSelectedFileIdx(i)} className={`px-1.5 py-0.5 rounded border truncate max-w-[85px] transition ${selectedFileIdx === i ? 'bg-emerald-600/40 border-emerald-400 text-emerald-200 font-bold' : 'bg-gray-800 text-gray-400 border-gray-700'}`}>
              素材{i + 1}: {f.split('/').pop()}
            </button>
          ))}
        </div>
      )}

      {/* 监视器视窗 */}
      <div className="bg-black/90 rounded-lg border border-gray-800 overflow-hidden flex flex-col items-center justify-center p-2 relative">
        {activeFilePath ? (
          <div className="w-full flex flex-col items-center justify-center space-y-1.5">
            <div className="flex items-center justify-between w-full px-0.5 text-[10px] text-gray-400">
              <span className="truncate max-w-[120px] font-mono" title={currentFileName}>
                {compareMode === 'clean' ? '[跳音] ' : '[原声] '}{currentFileName}
              </span>
              <div className="flex items-center space-x-1 shrink-0">
                <button
                  type="button"
                  onClick={() => { const nm = compareMode === 'clean' ? 'original' : 'clean'; setCompareMode(nm); setAutoSkip(nm === 'clean'); }}
                  className={`nodrag cursor-pointer px-1.5 py-0.5 rounded text-[10px] border transition ${compareMode === 'clean' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700' : 'bg-gray-800 text-gray-300 border-gray-700'}`}
                >
                  {compareMode === 'clean' ? '去停顿:开' : '去停顿:关'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="nodrag cursor-pointer px-1.5 py-0.5 bg-gray-800 hover:bg-gray-700 text-emerald-300 rounded text-[10px] border border-gray-700 transition"
                >
                  {isExpanded ? '收起' : '放大'}
                </button>
                <button
                  type="button"
                  onClick={() => data.onOpenPreview?.(currentVideoUrl, `[监看] ${currentFileName}`)}
                  className="nodrag cursor-pointer px-1.5 py-0.5 bg-emerald-950/80 hover:bg-emerald-850 text-emerald-200 rounded text-[10px] border border-emerald-600/50 transition font-bold"
                >
                  大屏
                </button>
              </div>
            </div>

            <div className={`transition-all duration-200 flex items-center justify-center bg-black rounded-lg border border-gray-800 overflow-hidden ${isVertical ? isExpanded ? 'w-48 aspect-[9/16]' : 'w-32 aspect-[9/16]' : 'w-full aspect-[16/9]'}`}>
              <video key={currentVideoUrl} src={currentVideoUrl} controls playsInline onTimeUpdate={handleTimeUpdate} onDblClick={() => data.onOpenPreview?.(currentVideoUrl, `[监看] ${currentFileName}`)} className="w-full h-full object-contain bg-black nodrag cursor-pointer" />
            </div>

            {/* 可视化红绿剪辑条 */}
            {hasSegments && totalDur > 0 && (
              <div className="w-full space-y-1 pt-1">
                <div className="flex justify-between text-[9px] font-mono text-gray-400">
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                    <span>净长 {data.stats?.clean_duration_sec}s</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
                    <span>切除 {data.stats?.cut_sec}s ({data.stats?.cut_ratio})</span>
                  </span>
                </div>
                <div className="w-full h-2.5 bg-rose-900/60 rounded-full overflow-hidden flex relative border border-gray-800">
                  {data.keepSegments?.map((seg) => (
                    <div key={seg.index} style={{ left: `${(seg.start / totalDur) * 100}%`, width: `${(seg.duration / totalDur) * 100}%` }} className="h-full bg-emerald-500/90 absolute hover:bg-emerald-400 transition" title={`语音段 #${seg.index}: ${seg.start}s - ${seg.end}s (${seg.duration}s)`} />
                  ))}
                  <div style={{ left: `${Math.min(100, Math.max(0, (playheadSec / totalDur) * 100))}%` }} className="absolute top-0 bottom-0 w-0.5 bg-white shadow-sm pointer-events-none transition-all duration-75" />
                </div>
              </div>
            )}
          </div>
        ) : isWashing ? (
          <div className="flex flex-col items-center justify-center h-32 space-y-2 text-emerald-400 font-mono text-xs">
            <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
            <span>正在批量探测 3 段素材并无损流切...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500 text-xs font-mono py-8">
            <span>暂无粗剪画面</span>
            <span className="text-[10px] text-gray-600 mt-1">点击下方按钮合并执行多段粗剪</span>
          </div>
        )}
      </div>

      {/* 门限调节 */}
      <div className="space-y-2 text-xs nodrag">
        <div>
          <div className="flex justify-between text-gray-400 mb-1">
            <span>静音过滤阈值</span>
            <span className="text-emerald-400 font-mono font-bold">{data.silenceDb ?? data.silenceThresholdDb ?? -28} dB</span>
          </div>
          <input
            type="range"
            min="-50"
            max="-20"
            step="1"
            value={data.silenceDb ?? data.silenceThresholdDb ?? -28}
            onInput={(e: any) => {
              const val = Number(e.target.value);
              if (data.onUpdate) data.onUpdate({ silenceDb: val, silenceThresholdDb: val });
              if (data.onUpdateSilenceDb) data.onUpdateSilenceDb(val);
            }}
            className="w-full accent-emerald-500 bg-gray-800 cursor-pointer h-1.5 rounded nodrag"
          />
        </div>
        <div>
          <div className="flex justify-between text-gray-400 mb-1">
            <span>最小停顿门限</span>
            <span className="text-emerald-400 font-mono font-bold">{data.minSilenceDurationSec ?? 0.6} 秒</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="1.5"
            step="0.1"
            value={data.minSilenceDurationSec ?? 0.6}
            onInput={(e: any) => {
              const val = Number(e.target.value);
              if (data.onUpdate) data.onUpdate({ minSilenceDurationSec: val });
              if (data.onUpdateMinSilence) data.onUpdateMinSilence(val);
            }}
            className="w-full accent-emerald-500 bg-gray-800 cursor-pointer h-1.5 rounded nodrag"
          />
        </div>
      </div>

      {/* 剪辑明细抽屉 */}
      {hasSegments && (
        <L1SegmentsInspector
          cutSegments={data.cutSegments}
          keepSegments={data.keepSegments}
        />
      )}

      {/* 底部操作区 */}
      <div className="pt-2 border-t border-gray-800 space-y-2 nodrag">
        <button
          type="button"
          onClick={() => data.onStartWash?.()}
          disabled={isWashing}
          className="nodrag cursor-pointer select-none w-full py-2 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-gray-800 disabled:to-gray-800 text-white rounded-lg font-bold text-xs transition shadow-lg shadow-emerald-950 flex items-center justify-center space-x-1.5 active:scale-[0.98]"
        >
          <span>{isWashing ? '多段粗剪中...' : hasCleanFile ? `重新执行多段粗剪 (${fileList.length}条)` : `合并执行多段粗剪 (${fileList.length}条)`}</span>
        </button>

        {hasSegments && (
          <div className="space-y-1.5 pt-1 nodrag">
            <button
              type="button"
              onClick={() => data.onProceedToL2?.(data.keepSegments || [])}
              className="nodrag cursor-pointer select-none w-full py-2 px-2.5 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 hover:from-amber-500 hover:to-yellow-400 border border-amber-400/50 text-gray-950 font-black text-xs rounded-lg transition shadow-lg shadow-amber-950/60 flex items-center justify-center space-x-1.5 active:scale-[0.98]"
            >
              <span>连线流转至 L2 爆款导演 ({data.keepSegments?.length}段切片) →</span>
            </button>
            <div className="flex justify-between items-center text-[10px] text-gray-400 px-1 nodrag">
              <span className="text-emerald-400/90 font-mono">已就绪 {data.keepSegments?.length} 段净片</span>
              <button
                type="button"
                onClick={() => data.onApplyCutToL3?.(data.keepSegments || [])}
                className="nodrag cursor-pointer text-gray-400 hover:text-emerald-300 underline transition"
              >
                直传L3轨道
              </button>
            </div>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="!bg-emerald-400 !w-3 !h-3" />
    </div>
  );
};
