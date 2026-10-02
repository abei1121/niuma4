// web_frontend/src/components/ziwei/PipelineFlowViewer.tsx - 8-Step Pipeline View (<= 250 lines)
import { FunctionalComponent } from 'preact';

const PIPELINE_STEPS = [
  { step: '01', title: '用户输入生辰与经纬度', type: '物理基准', desc: '公历年月日时与地理坐标输入。' },
  { step: '02', title: '真太阳时校准 (solarTime.ts)', type: '物理公式', desc: '经度时角差(4分/度) + 太阳时差方程(EoT)，解决早晚子时与真实光照时角偏差。' },
  { step: '03', title: '农历正统换年与节气解耦', type: '正统历法', desc: '紫微严格按农历正月初一换年，八字依立春换年。两者物理隔离，捍卫来因宫命脉。' },
  { step: '04', title: '紫微斗数十二宫星曜排布 (iztro)', type: '纯数术排盘', desc: '五行局数定局、十四主星庙旺利陷、六吉六煞、博士神煞纯算法排布。' },
  { step: '05', title: '三套命盘事实树独立编译', type: '事实隔离', desc: '中州树纯星系、钦天树纯象数、双宗师全景融合，分别剔除跨门派干扰。' },
  { step: '06', title: '组装只读 ASCII 事实账本', type: '事实契约', desc: '将全部客观结论固化为只读树，置顶强塞给大模型，彻底封杀大模型自己查盘可能。' },
  { step: '07', title: 'ECDSA 密码学签名与能量校验', type: '安全中枢', desc: '纯 Rust 微服务 (:8096) 验签并扣除天命能量（全盘6点/叩问1点），防止越狱。' },
  { step: '08', title: '官方私有 agy 流式场景解构', type: '大模型译者', desc: '大模型严禁算星，只作为军师将客观事实翻译为现代工作、财务、合伙破局场景。' },
];

export const PipelineFlowViewer: FunctionalComponent = () => {
  return (
    <div className="bg-[#0b101b] border border-gray-800 p-5 rounded-2xl space-y-4 text-xs">
      <h3 className="font-bold text-sm text-cyan-300">
        人生运势历 · 8 步排盘推演闭环流水线
      </h3>
      <div className="space-y-3">
        {PIPELINE_STEPS.map(item => (
          <div key={item.step} className="p-3 rounded-lg bg-gray-900/60 border border-gray-800 flex justify-between items-center">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-amber-400">{item.step}</span>
                <span className="font-bold text-gray-200">{item.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-400">{item.type}</span>
              </div>
              <p className="text-gray-400">{item.desc}</p>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">100% 确定性校验</span>
          </div>
        ))}
      </div>
    </div>
  );
};
