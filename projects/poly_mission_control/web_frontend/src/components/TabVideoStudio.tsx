import { FunctionalComponent } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { getVideoTasks, VideoTask } from '../api/video';
import { StudioCanvas } from './studio_canvas/StudioCanvas';

export const TabVideoStudio: FunctionalComponent = () => {
  const [tasks, setTasks] = useState<VideoTask[]>([]);
  const [showTasks, setShowTasks] = useState(false);

  useEffect(() => {
    getVideoTasks().then(setTasks).catch(console.error);
    const timer = setInterval(() => {
      getVideoTasks().then(setTasks).catch(console.error);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-4">
      {/* 核心工作流画布 (主操作工作台) */}
      <StudioCanvas />

      {/* 底部精简任务队列 (支持折叠，保持视野最大化) */}
      <div className="bg-[#0b101b] rounded-xl border border-gray-800 overflow-hidden shadow">
        <div
          onClick={() => setShowTasks(!showTasks)}
          className="px-4 py-2.5 bg-gray-900/60 hover:bg-gray-900/90 cursor-pointer flex items-center justify-between transition text-xs select-none"
        >
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span className="font-bold text-gray-300">底层转码流水线监控</span>
            <span className="px-2 py-0.5 rounded-full bg-gray-800 text-[10px] text-gray-400 font-mono">
              {tasks.length} 项任务
            </span>
          </div>
          <span className="text-gray-500 font-mono text-[11px]">
            {showTasks ? '收起 ▴' : '展开查看 /tasks.json ▾'}
          </span>
        </div>

        {showTasks && (
          <div className="p-4 border-t border-gray-800/80 bg-gray-950/60">
            {tasks.length === 0 ? (
              <div className="text-center py-4 text-gray-500 text-xs font-mono">
                当前任务流水线暂无执行中的物理转码任务
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {tasks.map((t) => (
                  <div key={t.id} className="bg-gray-900/80 border border-gray-800 p-2.5 rounded-lg flex items-center justify-between text-xs font-mono">
                    <div className="space-y-0.5 truncate mr-3">
                      <div className="font-bold text-gray-200">{t.name}</div>
                      <div className="text-gray-500 text-[10px] truncate">{t.input_file}</div>
                    </div>
                    <div className="flex items-center space-x-3 shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.status === 'completed' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' :
                        t.status === 'processing' ? 'bg-amber-950 text-amber-300 border border-amber-500/40 animate-pulse' :
                        'bg-gray-800 text-gray-400'
                      }`}>
                        {t.status}
                      </span>
                      <span className="text-gray-400 text-[11px]">{t.progress || 0}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
