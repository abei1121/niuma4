import { FunctionalComponent } from 'preact';
import { SECTOR_PLATES } from './constants';

interface Props {
  activeSectorId: string;
  activeSubOptionId: string;
  onSelectSector: (sector: any) => void;
  onSelectSubOption: (subOption: any) => void;
}

export const L2SectorSelector: FunctionalComponent<Props> = ({
  activeSectorId,
  activeSubOptionId,
  onSelectSector,
  onSelectSubOption,
}) => {
  const currentSector = SECTOR_PLATES.find((s) => s.id === activeSectorId) || SECTOR_PLATES[0];
  const currentSubOption = currentSector.subOptions.find((so) => so.id === activeSubOptionId) || currentSector.subOptions[0];

  return (
    <>
      <div className="nodrag">
        <label className="text-gray-400 block mb-1.5 font-medium flex items-center justify-between">
          <span>第一级：选择核心赛道 (12大黄金板块)</span>
          <span className="text-[10px] text-amber-400/90 font-mono">当前: {currentSector.name}</span>
        </label>
        <div className="grid grid-cols-4 gap-1">
          {SECTOR_PLATES.map((s) => {
            const isSelected = s.id === activeSectorId;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelectSector(s)}
                className={`nodrag cursor-pointer select-none py-1.5 px-1 rounded text-[11px] font-bold transition text-center border truncate ${
                  isSelected
                    ? 'bg-amber-500 text-gray-950 border-amber-300 shadow-md shadow-amber-950/60 scale-[1.03] ring-1 ring-amber-300'
                    : 'bg-gray-900/80 text-gray-300 border-gray-800 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {s.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="nodrag bg-black/25 p-2 rounded-lg border border-gray-800/80 space-y-1.5">
        <label className="text-amber-300/90 block font-medium flex items-center justify-between text-[11px]">
          <span>第二级：【{currentSector.name}】细分爆款导演角色</span>
          <span className="text-[10px] text-gray-400 font-mono">6大子选项</span>
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {currentSector.subOptions.map((sub) => {
            const isSelected = sub.id === activeSubOptionId;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => onSelectSubOption(sub)}
                title={sub.name}
                className={`nodrag cursor-pointer select-none py-1.5 px-2 rounded text-[11px] font-bold transition text-left border truncate ${
                  isSelected
                    ? 'bg-amber-500/25 text-amber-300 border-amber-400 shadow-sm ring-1 ring-amber-400/50'
                    : 'bg-gray-900/90 text-gray-400 border-gray-800 hover:bg-gray-850 hover:text-gray-200'
                }`}
              >
                {sub.name}
              </button>
            );
          })}
        </div>
        <div className="text-[10px] text-gray-400 pt-1 border-t border-gray-800/60 leading-snug italic">
          "{currentSubOption.desc}"
        </div>
      </div>
    </>
  );
};
