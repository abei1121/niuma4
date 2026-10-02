// web_frontend/src/components/ziwei/SolarCalibrationCard.tsx - Physical & Astro Calibration Card (<= 250 lines)
import { FunctionalComponent } from 'preact';

interface SolarCalibrationCardProps {
  profile: {
    birthDate: string;
    birthTime: string;
    gender: '男' | '女';
    longitude: number;
  };
  astrolabe: any;
}

export const SolarCalibrationCard: FunctionalComponent<SolarCalibrationCardProps> = ({ profile, astrolabe }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
      <div className="bg-[#0b101b] border border-gray-800 p-4 rounded-xl space-y-2">
        <h4 className="font-bold text-cyan-400 pb-1 border-b border-gray-800 flex items-center justify-between">
          <span>天文物理时差校准 (solarTime.ts)</span>
          <span className="text-[10px] text-gray-500 font-mono">100% 确定性纯算法</span>
        </h4>
        <div className="flex justify-between py-1">
          <span className="text-gray-400">钟表输入时间:</span>
          <span className="text-gray-200 font-mono">{profile.birthDate} {profile.birthTime}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-gray-400">真太阳时校准:</span>
          <span className="text-emerald-400 font-bold font-mono">{astrolabe.trueSolarTimeStr}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-gray-400">时差方程 (EoT) 偏差:</span>
          <span className="text-gray-300 font-mono">
            {astrolabe.offsetMinutes > 0 ? '+' : ''}{astrolabe.offsetMinutes.toFixed(1)} 分钟 (经度 {profile.longitude.toFixed(2)}°E)
          </span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-gray-400">正统农历换年四柱:</span>
          <span className="text-amber-300 font-bold font-mono">{astrolabe.lunarFP} (正月初一换年)</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-gray-400">节气四柱 (八字立春换年):</span>
          <span className="text-gray-400 font-mono">{astrolabe.solarTermsFP}</span>
        </div>
      </div>

      <div className="bg-[#0b101b] border border-gray-800 p-4 rounded-xl space-y-2">
        <h4 className="font-bold text-amber-400 pb-1 border-b border-gray-800 flex items-center justify-between">
          <span>命局定锚核心立极</span>
          <span className="text-[10px] text-gray-500 font-mono">钦天门理法</span>
        </h4>
        <div className="flex justify-between py-1">
          <span className="text-gray-400">来因宫 (一生天命业力之锚):</span>
          <span className="text-amber-300 font-bold">{astrolabe.laiYinName}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-gray-400">生年天干:</span>
          <span className="text-gray-200 font-bold">天干【{astrolabe.birthYearStem}】</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-gray-400">五行局数:</span>
          <span className="text-gray-200">{astrolabe.raw.fiveElementsClass}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-gray-400">生年四化定数:</span>
          <span className="text-gray-200">{astrolabe.birthSiHuaList.join(' | ')}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-gray-400">对冲极端破耗警示:</span>
          <span className="text-rose-400 font-bold">
            {astrolabe.clashWarnings.length > 0 ? astrolabe.clashWarnings.join('; ') : '本盘无自化忌冲对宫之极败象'}
          </span>
        </div>
      </div>
    </div>
  );
};
