import { FunctionalComponent } from 'preact';
import { PLATFORM_RULES } from './constants';

interface Props {
  activePlatformId: string;
  onSelectPlatform: (id: string) => void;
}

export const L2PlatformCard: FunctionalComponent<Props> = ({ activePlatformId, onSelectPlatform }) => {
  const currentPlatform = PLATFORM_RULES.find((p) => p.id === activePlatformId) || PLATFORM_RULES[0];

  return (
    <div className="nodrag">
      <label className="text-gray-400 block mb-1.5 font-medium flex items-center justify-between text-xs">
        <span>第三级：目标发布平台 (特点与避坑规则)</span>
        <span className="text-[10px] text-gray-400 font-mono">8大选项 (4×2网格)</span>
      </label>
      <div className="grid grid-cols-4 gap-1">
        {PLATFORM_RULES.map((p) => {
          const isSelected = p.id === activePlatformId;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectPlatform(p.id)}
              className={`nodrag cursor-pointer select-none py-1.5 px-1 rounded text-[11px] font-bold transition text-center border truncate ${
                isSelected
                  ? 'bg-amber-500 text-gray-950 border-amber-300 shadow-md shadow-amber-950/60 ring-1 ring-amber-300'
                  : 'bg-gray-900/80 text-gray-300 border-gray-700 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {p.name}
            </button>
          );
        })}
      </div>

      <div className="mt-2 p-2 rounded-lg bg-gray-900/90 border border-gray-800 space-y-1.5 text-[11px]">
        <div className="flex items-start space-x-1">
          <span className="px-1 py-0.2 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded text-[9px] shrink-0 mt-0.5 font-bold">
            特点
          </span>
          <span className="text-gray-300 leading-snug">{currentPlatform.features}</span>
        </div>
        <div className="flex items-start space-x-1">
          <span className="px-1 py-0.2 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded text-[9px] shrink-0 mt-0.5 font-bold">
            避坑
          </span>
          <span className="text-amber-200/90 leading-snug">{currentPlatform.pitfallRules}</span>
        </div>
        <div className="text-[10px] text-gray-400 pt-0.5 border-t border-gray-800 flex justify-between font-mono">
          <span>推荐节奏: {currentPlatform.pacing}</span>
          <span className="text-gray-300">比例 {currentPlatform.recommendedRatio}</span>
        </div>
      </div>
    </div>
  );
};
