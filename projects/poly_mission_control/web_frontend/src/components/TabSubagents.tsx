import { FunctionalComponent } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { SubagentItem } from '../types/system';
import { getSubagentsStatus, dispatchSubagent } from '../api/system';

export const TabSubagents: FunctionalComponent = () => {
  const [agents, setAgents] = useState<SubagentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [taskInput, setTaskInput] = useState('');
  const [dispatching, setDispatching] = useState(false);
  const [dispatchMsg, setDispatchMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getSubagentsStatus();
      if (res && Array.isArray(res.agents)) {
        setAgents(res.agents);
      } else {
        setAgents([]);
      }
    } catch (e) {
      console.error('获取子代理状态异常:', e);
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDispatch = async () => {
    if (!taskInput.trim()) return;
    setDispatching(true);
    setDispatchMsg(null);
    try {
      const res = await dispatchSubagent(taskInput.trim());
      setDispatchMsg(res?.message || '指令下发成功！');
      setTaskInput('');
      await loadData();
    } catch (e: any) {
      setDispatchMsg(`下发异常: ${e.message || e}`);
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 顶部指令派发终端 */}
      <div className="bg-[#0f172a] border border-gray-800 p-5 rounded-2xl space-y-3 shadow-lg">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <h3 className="text-sm font-semibold text-gray-100">特战子代理中枢命令下发通道</h3>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="向特战子代理下达指令 (如: 提取视频台词文案、巡检硬件负载)..."
            value={taskInput}
            onInput={(e: any) => setTaskInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleDispatch(); }}
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3.5 py-2 text-xs text-gray-100 font-mono focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={handleDispatch}
            disabled={dispatching || !taskInput.trim()}
            className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition shrink-0"
          >
            {dispatching ? '派发中...' : '派发特战指令'}
          </button>
        </div>
        {dispatchMsg && (
          <div className="text-xs font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800/80 p-2 rounded-lg">
            {dispatchMsg}
          </div>
        )}
      </div>

      {/* 特战子代理运行矩阵卡片 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-gray-300">特战代理编制与实时态势</div>
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-medium transition"
          >
            {loading ? '探活中...' : '刷新状态'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loading && agents.length === 0 && (
            <div className="col-span-3 py-16 text-center text-xs text-cyan-400 animate-pulse">
              正在与特战子代理通信中枢建立握手...
            </div>
          )}
          {!loading && agents.length === 0 && (
            <div className="col-span-3 py-16 text-center text-xs text-gray-500">
              暂未检测到活动的特战子代理编制
            </div>
          )}
          {agents.map((ag) => (
            <div
              key={ag.id}
              className="bg-[#0f172a] border border-gray-800 hover:border-cyan-500/40 rounded-2xl p-5 space-y-3 shadow-md flex flex-col justify-between transition"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-cyan-300 font-bold text-xs">#{ag.id}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-800 font-medium">
                    {ag.status || '就绪在线'}
                  </span>
                </div>
                <div className="font-sans font-bold text-gray-100 text-sm">{ag.name}</div>
                <div className="text-xs font-medium text-cyan-400/90 font-mono">{ag.role}</div>
                <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">{ag.description}</p>
              </div>

              <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between text-[11px] font-mono text-gray-500">
                <span>累计战役: <b className="text-white">{ag.task_count || 0}</b> 次</span>
                <span>活跃: {(ag.last_active || '--').slice(11, 19)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
