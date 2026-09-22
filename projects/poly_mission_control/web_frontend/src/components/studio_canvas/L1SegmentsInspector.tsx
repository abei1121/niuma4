import { FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';
import { KeepSegmentItem, CutSegmentItem } from './types';

interface Props {
  cutSegments?: CutSegmentItem[];
  keepSegments?: KeepSegmentItem[];
}

export const L1SegmentsInspector: FunctionalComponent<Props> = ({ cutSegments, keepSegments }) => {
  const [showInspector, setShowInspector] = useState(false);
  const [activeTab, setActiveTab] = useState<'cuts' | 'keeps'>('cuts');

  return (
    <div className="bg-gray-900/90 border border-gray-800 rounded-lg p-2 text-[10px] space-y-1.5 nodrag">
      <div className="flex items-center justify-between border-b border-gray-800 pb-1">
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => { setActiveTab('cuts'); setShowInspector(true); }}
            className={`nodrag cursor-pointer font-mono font-bold transition ${activeTab === 'cuts' ? 'text-rose-400' : 'text-gray-500'}`}
          >
            已切除停顿 ({cutSegments?.length || 0})
          </button>
          <span className="text-gray-700">|</span>
          <button
            type="button"
            onClick={() => { setActiveTab('keeps'); setShowInspector(true); }}
            className={`nodrag cursor-pointer font-mono font-bold transition ${activeTab === 'keeps' ? 'text-emerald-400' : 'text-gray-500'}`}
          >
            保留发音 ({keepSegments?.length || 0})
          </button>
        </div>
        <button
          type="button"
          onClick={() => setShowInspector(!showInspector)}
          className="nodrag cursor-pointer text-gray-400 hover:text-gray-200"
        >
          {showInspector ? '收起' : '展开'}
        </button>
      </div>

      {showInspector && (
        <div className="max-h-36 overflow-y-auto space-y-1 pr-1 nodrag font-mono">
          {activeTab === 'cuts' ? (
            cutSegments?.map((cut) => (
              <div key={cut.index} className="flex justify-between bg-black/50 px-1.5 py-0.5 rounded border border-rose-950 text-gray-300">
                <span className="text-rose-400 font-bold truncate max-w-[120px]">{cut.label || '停顿'} #{cut.index}</span>
                <span>{cut.start}s - {cut.end}s</span>
                <span className="text-rose-300">-{cut.duration}s</span>
              </div>
            ))
          ) : (
            keepSegments?.map((seg) => (
              <div key={seg.index} className="flex justify-between bg-black/50 px-1.5 py-0.5 rounded border border-emerald-950 text-gray-300">
                <span className="text-emerald-400 font-bold truncate max-w-[120px]">[{seg.source_file || '素材'}] #{seg.index}</span>
                <span>{seg.start}s - {seg.end}s</span>
                <span className="text-emerald-300">+{seg.duration}s</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
