import { FunctionalComponent } from 'preact';
import { Handle, Position } from '@xyflow/react';
import { NodeL3Data } from './types';

interface Props {
  data: NodeL3Data;
}

export const NodeL3NleEditor: FunctionalComponent<Props> = ({ data }) => {
  const items = data.items || [];
  const subtitleCount = items.filter((i) => i.trackType === 'subtitle').length;
  const audioCount = items.filter((i) => i.trackType === 'audio').length;
  const effectCount = items.filter((i) => i.trackType === 'effect').length;
  const aiGenCount = items.filter((i) => i.trackType === 'ai_gen').length;
  const hasTracks = items.length > 0;

  return (
    <div
      className={`bg-[#0f172a]/95 border-2 ${
        data.isActiveFocus
          ? 'border-purple-400 ring-4 ring-purple-500/40 shadow-2xl shadow-purple-950/60 scale-[1.02]'
          : 'border-purple-500/50 shadow-xl shadow-purple-950/40'
      } rounded-xl p-4 w-80 text-gray-200 transition-all duration-300`}
    >
      <Handle type="target" position={Position.Left} className="!bg-purple-400 !w-3 !h-3" />

      <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-800 cursor-grab active:cursor-grabbing select-none">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 text-xs font-bold bg-purple-500/20 text-purple-300 rounded border border-purple-500/30">
            L3
          </span>
          <span className="font-bold text-sm text-gray-100">剪映多轨精修工作台</span>
        </div>
        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${hasTracks ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-gray-800 text-gray-400'}`}>
          {hasTracks ? `${items.length} 轨就绪` : '待注入'}
        </span>
      </div>

      <div className="space-y-3 text-xs">
        {/* 4 大轨道指示统计 */}
        <div className="grid grid-cols-2 gap-2 text-[11px] nodrag">
          <div className="bg-gray-900/90 border border-gray-800 p-1.5 rounded flex justify-between items-center">
            <span className="text-gray-400">花字/字幕</span>
            <span className="font-bold text-cyan-400">{subtitleCount} 处</span>
          </div>
          <div className="bg-gray-900/90 border border-gray-800 p-1.5 rounded flex justify-between items-center">
            <span className="text-gray-400">音效/BGM</span>
            <span className="font-bold text-emerald-400">{audioCount} 个</span>
          </div>
          <div className="bg-gray-900/90 border border-gray-800 p-1.5 rounded flex justify-between items-center">
            <span className="text-gray-400">动效/转场</span>
            <span className="font-bold text-amber-400">{effectCount} 个</span>
          </div>
          <div className="bg-gray-900/90 border border-gray-800 p-1.5 rounded flex justify-between items-center">
            <span className="text-gray-400">AI视效/生图</span>
            <span className="font-bold text-purple-400">{aiGenCount} 处</span>
          </div>
        </div>

        {/* 迷你轨道时间线示意 */}
        <div className="bg-black/60 border border-gray-800 rounded p-2 space-y-1.5 nodrag">
          <div className="flex items-center space-x-1">
            <span className="w-8 text-[9px] text-gray-500 font-mono">画面</span>
            <div className="flex-1 h-2 bg-blue-600/40 rounded flex space-x-0.5 px-0.5">
              <div className="w-1/3 bg-blue-500 rounded-sm"></div>
              <div className="w-1/2 bg-blue-400 rounded-sm"></div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-8 text-[9px] text-gray-500 font-mono">花字</span>
            <div className="flex-1 h-2 bg-cyan-600/40 rounded flex space-x-1 px-1">
              <div className="w-1/4 bg-cyan-400 rounded-sm"></div>
              <div className="w-1/3 bg-cyan-300 rounded-sm ml-auto"></div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-8 text-[9px] text-gray-500 font-mono">音效</span>
            <div className="flex-1 h-2 bg-emerald-600/40 rounded flex space-x-2 px-2">
              <div className="w-4 bg-emerald-400 rounded-sm"></div>
              <div className="w-4 bg-emerald-400 rounded-sm ml-4"></div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-8 text-[9px] text-gray-500 font-mono">插屏</span>
            <div className="flex-1 h-2 bg-purple-600/40 rounded flex space-x-1 px-2">
              <div className="w-8 bg-purple-400 rounded-sm ml-8"></div>
            </div>
          </div>
        </div>

        {/* 状态与操作按钮 */}
        <div className="space-y-2 pt-1 nodrag">
          <button
            type="button"
            onClick={() => data.onOpenDrawer?.()}
            className="nodrag cursor-pointer select-none w-full py-2 px-3 bg-purple-900/60 hover:bg-purple-800/80 border border-purple-500/40 text-purple-200 rounded-lg font-bold text-center text-xs transition flex items-center justify-center space-x-1.5 active:scale-[0.98]"
          >
            <span>展开剪映式多轨时间线 ({items.length} 轨精修)</span>
          </button>

          {hasTracks ? (
            <button
              type="button"
              onClick={() => data.onProceedToL4?.()}
              className="nodrag cursor-pointer select-none w-full py-2 px-3 bg-gradient-to-r from-rose-600 via-pink-500 to-rose-500 hover:from-rose-500 hover:to-pink-400 text-white font-black rounded-lg text-xs transition shadow-lg shadow-rose-950/60 flex items-center justify-center space-x-1.5 active:scale-[0.98]"
            >
              <span>打通连线并推进至 L4 硬件导出 →</span>
            </button>
          ) : (
            <div className="text-[10px] text-gray-500 text-center py-1 font-mono italic">
              在 L2 驱动原生 AGY 后将自动流转注入
            </div>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="!bg-purple-400 !w-3 !h-3" />
    </div>
  );
};
