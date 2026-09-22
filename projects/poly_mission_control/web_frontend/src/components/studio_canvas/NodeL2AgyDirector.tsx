import { FunctionalComponent } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { Handle, Position } from '@xyflow/react';
import { NodeL2Data } from './types';
import { PLATFORM_RULES, SECTOR_PLATES } from './constants';
import { L2SectorSelector } from './L2SectorSelector';
import { L2PlatformCard } from './L2PlatformCard';

interface Props {
  data: NodeL2Data;
}

export const NodeL2AgyDirector: FunctionalComponent<Props> = ({ data }) => {
  const [activeSectorId, setActiveSectorId] = useState<string>(data.sectorId || 'xuanxue');
  const [activeSubOptionId, setActiveSubOptionId] = useState<string>(data.subOptionId || 'xx_mingpan');
  const [activePrompt, setActivePrompt] = useState<string>(data.directorPrompt || '爆款自媒体玄学名人命盘视频导演');
  const [activePlatformId, setActivePlatformId] = useState<string>(data.platformId || 'douyin');
  const [activeTopic, setActiveTopic] = useState<string>(data.topic || '');
  const [localIsGenerating, setLocalIsGenerating] = useState(false);

  useEffect(() => {
    if (data.sectorId && data.sectorId !== activeSectorId) setActiveSectorId(data.sectorId);
  }, [data.sectorId]);

  useEffect(() => {
    if (data.subOptionId && data.subOptionId !== activeSubOptionId) setActiveSubOptionId(data.subOptionId);
  }, [data.subOptionId]);

  useEffect(() => {
    if (data.directorPrompt !== undefined && data.directorPrompt !== activePrompt) setActivePrompt(data.directorPrompt);
  }, [data.directorPrompt]);

  useEffect(() => {
    if (data.platformId && data.platformId !== activePlatformId) setActivePlatformId(data.platformId);
  }, [data.platformId]);

  useEffect(() => {
    if (data.topic !== undefined && data.topic !== activeTopic) setActiveTopic(data.topic);
  }, [data.topic]);

  const currentSector = SECTOR_PLATES.find((s) => s.id === activeSectorId) || SECTOR_PLATES[0];
  const currentPlatform = PLATFORM_RULES.find((p) => p.id === activePlatformId) || PLATFORM_RULES[0];
  const isGenerating = Boolean(data.isGenerating || localIsGenerating);
  const trackCount = data.generatedTracks?.length || 0;
  const hasSourceSegments = Boolean(data.sourceSegments && data.sourceSegments.length > 0);

  const handleSelectSector = (sector: typeof currentSector) => {
    const firstSub = sector.subOptions[0];
    setActiveSectorId(sector.id);
    setActiveSubOptionId(firstSub.id);
    setActivePrompt(firstSub.roleTitle);
    data.onUpdate?.({
      sectorId: sector.id,
      directorId: sector.id,
      subOptionId: firstSub.id,
      directorPrompt: firstSub.roleTitle,
    });
  };

  const handleSelectSubOption = (sub: any) => {
    setActiveSubOptionId(sub.id);
    setActivePrompt(sub.roleTitle);
    data.onUpdate?.({
      subOptionId: sub.id,
      directorPrompt: sub.roleTitle,
    });
  };

  const handleSelectPlatform = (platformId: string) => {
    setActivePlatformId(platformId);
    data.onUpdate?.({ platformId });
  };

  const handleTriggerGenerate = async () => {
    if (isGenerating) return;
    setLocalIsGenerating(true);
    try {
      await data.onGenerateDraft?.();
    } finally {
      setLocalIsGenerating(false);
    }
  };

  return (
    <div
      className={`bg-[#0f172a]/95 border-2 ${
        data.isActiveFocus
          ? 'border-amber-400 ring-4 ring-amber-500/40 shadow-2xl shadow-amber-900/60 scale-[1.02]'
          : 'border-amber-500/50 shadow-xl shadow-amber-950/40'
      } rounded-xl p-4 w-[25rem] text-gray-200 space-y-3 transition-all duration-300`}
    >
      <Handle type="target" position={Position.Left} className="!bg-amber-400 !w-3 !h-3" />

      <div className="flex items-center justify-between pb-2 border-b border-gray-800 cursor-grab active:cursor-grabbing select-none">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 text-xs font-bold bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
            L2
          </span>
          <span className="font-bold text-sm text-gray-100">原生 AGY 爆款赛道导演</span>
        </div>
        <div className="flex items-center space-x-1.5 font-mono">
          <span className="text-[11px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {currentSector.name}
          </span>
          <span className="text-[11px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
            {currentPlatform.name}
          </span>
        </div>
      </div>

      <div className="space-y-2.5 text-xs">
        <div className="p-2 rounded bg-gray-900/80 border border-gray-800/80 flex items-center justify-between">
          <span className="text-gray-400 text-[11px]">上游粗洗素材:</span>
          <span className="font-mono text-[11px] text-amber-300 truncate max-w-[180px]">
            {data.cleanFile ? data.cleanFile.split('/').pop() : hasSourceSegments ? '精剪片段已就绪' : '未就绪 (可先定导演)'}
          </span>
        </div>

        <L2SectorSelector
          activeSectorId={activeSectorId}
          activeSubOptionId={activeSubOptionId}
          onSelectSector={handleSelectSector}
          onSelectSubOption={handleSelectSubOption}
        />

        <div className="nodrag">
          <label className="text-gray-400 block mb-1 font-medium flex items-center justify-between">
            <span>AI 导演核心提示词 (自由手写/微调)</span>
            <span className="text-[10px] text-amber-400 font-mono">Prompt 锚点</span>
          </label>
          <input
            type="text"
            value={activePrompt}
            onInput={(e: any) => {
              const val = e.target.value;
              setActivePrompt(val);
              data.onUpdate?.({ directorPrompt: val });
            }}
            placeholder="例如: 爆款自媒体玄学名人命盘视频导演"
            className="w-full bg-gray-900 border border-gray-700 text-amber-300 rounded px-2.5 py-1.5 focus:border-amber-500 font-medium nodrag text-xs font-mono"
          />
        </div>

        <div className="nodrag">
          <label className="text-gray-400 block mb-1 font-medium">视频核心主题 / 口播素材关键词</label>
          <input
            type="text"
            placeholder="例如: 雷军大运流年、深圳法拍房捡漏、实体餐饮开店账本"
            value={activeTopic}
            onInput={(e: any) => {
              const val = e.target.value;
              setActiveTopic(val);
              data.onUpdate?.({ topic: val });
            }}
            className="w-full bg-gray-900 border border-gray-700 text-gray-100 rounded px-2.5 py-1.5 focus:border-amber-500 font-medium nodrag text-xs"
          />
        </div>

        <L2PlatformCard
          activePlatformId={activePlatformId}
          onSelectPlatform={handleSelectPlatform}
        />

        <div className="pt-1 nodrag">
          <button
            type="button"
            onClick={handleTriggerGenerate}
            disabled={isGenerating}
            className="nodrag cursor-pointer w-full py-2.5 px-3 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-400 text-white rounded-lg font-bold text-xs transition shadow-lg shadow-amber-950 flex items-center justify-center space-x-2"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="animate-pulse font-mono">原生 AGY 旗舰大模型推导中...</span>
              </>
            ) : (
              <span>驱动原生 AGY 生成精准分镜</span>
            )}
          </button>
        </div>

        {(data.draftReady || (data.generatedTracks && data.generatedTracks.length > 0)) && (
          <div className="bg-amber-950/50 border-2 border-amber-400/80 rounded-lg p-3 space-y-2 text-[11px] nodrag shadow-lg shadow-amber-950/60 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-amber-800/80 pb-1.5">
              <span className="font-bold text-amber-300">
                原生 AGY 导演剧本推导就绪
              </span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono">
                {trackCount} 轨分镜
              </span>
            </div>
            {data.hookTitle && (
              <div className="font-bold text-amber-200 text-xs bg-black/40 p-2 rounded border border-amber-900/60 leading-snug">
                {data.hookTitle}
              </div>
            )}
            <div className="text-gray-200 leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap bg-black/30 p-2 rounded text-[10px] font-mono border border-gray-800">
              {data.draftSummary || '已根据专业赛道导演解析出黄金前3秒钩子与情绪高潮卡点'}
            </div>

            {trackCount > 0 && (
              <button
                type="button"
                onClick={() => data.onProceedToL3?.(data.generatedTracks || [])}
                className="nodrag cursor-pointer w-full py-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-gray-950 font-black rounded-lg text-xs transition shadow-lg shadow-emerald-950/60 flex items-center justify-center space-x-1.5 active:scale-[0.98]"
              >
                <span>打通连线并流转至 L3 时间线 ({trackCount} 轨) →</span>
              </button>
            )}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="!bg-amber-400 !w-3 !h-3" />
    </div>
  );
};
