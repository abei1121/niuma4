import { FunctionalComponent } from 'preact';
import { Handle, Position } from '@xyflow/react';
import { NodeL4Data } from './types';

interface Props {
  data: NodeL4Data;
}

export const NodeL4Render: FunctionalComponent<Props> = ({ data }) => {
  const isRendering = data.status === 'rendering';

  return (
    <div className={`bg-[#0f172a]/95 border-2 ${data.isActiveFocus ? 'border-rose-400 ring-4 ring-rose-500/40 shadow-2xl shadow-rose-950/60 scale-[1.02]' : 'border-rose-500/50 shadow-xl shadow-rose-950/40'} rounded-xl p-4 w-72 text-gray-200 transition-all duration-300`}>
      <Handle type="target" position={Position.Left} className="!bg-rose-400 !w-3 !h-3" />

      <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-800 cursor-grab active:cursor-grabbing select-none">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 text-xs font-bold bg-rose-500/20 text-rose-300 rounded border border-rose-500/30">
            L4
          </span>
          <span className="font-bold text-sm text-gray-100">Apple M2 硬件压制</span>
        </div>
        <span className="text-[10px] text-rose-400 font-mono">VideoToolbox</span>
      </div>

      <div className="space-y-3 text-xs">
        <div className="bg-gray-900/90 border border-gray-800 p-2 rounded space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-400">硬件编码加速</span>
            <span className="text-emerald-400 font-mono font-bold">Apple M2 GPU</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">输出目标</span>
            <span className="text-gray-300 font-mono">/outputs</span>
          </div>
        </div>

        {isRendering ? (
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-rose-400 font-bold">硬件压制中...</span>
              <span className="text-gray-300 font-mono">{data.progress}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-rose-500 h-2 transition-all duration-300 rounded-full"
                style={{ width: `${data.progress}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="space-y-2 nodrag">
            <button
              type="button"
              onClick={() => data.onStartRender?.()}
              className="nodrag cursor-pointer select-none w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600 via-rose-600 to-pink-600 hover:from-emerald-500 hover:via-rose-500 hover:to-pink-500 text-white rounded-lg font-bold text-center transition shadow-lg shadow-rose-950 flex items-center justify-center space-x-1.5 active:scale-95"
            >
              <span>100% 全自动双轨出片</span>
            </button>
            <div className="text-[10px] text-gray-400 text-center leading-tight">
              Whisper词级字幕 + 9:16毛玻璃 + BGM下潜 + 剪映草稿
            </div>
          </div>
        )}

        {data.outputFile && (
          <div className="text-[11px] text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 p-2 rounded truncate font-mono">
            成品: {data.outputFile}
          </div>
        )}
      </div>
    </div>
  );
};
