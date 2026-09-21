import { FunctionalComponent } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { DaemonStatus, CrontabJob } from '../types/system';
import { getDaemonsStatus, restartDaemon, getCrontabJobs, runCrontabNow, getLogs } from '../api/system';

export const TabServicesLogs: FunctionalComponent = () => {
  const [daemons, setDaemons] = useState<DaemonStatus[]>([]);
  const [crontab, setCrontab] = useState<CrontabJob[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [activeSub, setActiveSub] = useState<'services' | 'logs'>('services');
  const [logChannel, setLogChannel] = useState<'mc' | 'tg' | 'keeper' | 'proxy' | 'lan'>('mc');

  const refreshServices = async () => {
    try {
      const [d, c] = await Promise.all([getDaemonsStatus(), getCrontabJobs()]);
      setDaemons(d || []);
      setCrontab(c || []);
    } catch (e) {
      console.error(e);
    }
  };

  const refreshLogs = async (channel = logChannel) => {
    try {
      const res = await getLogs(channel);
      setLogs(res?.lines || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (activeSub === 'services') refreshServices();
    else refreshLogs(logChannel);
  }, [activeSub, logChannel]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex space-x-2 bg-gray-900 p-1 rounded-xl border border-gray-800 w-fit">
          <button
            onClick={() => setActiveSub('services')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${activeSub === 'services' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
          >
            系统守护与定时任务
          </button>
          <button
            onClick={() => setActiveSub('logs')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${activeSub === 'logs' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
          >
            全量实时日志流
          </button>
        </div>

        <button
          onClick={() => {
            if (activeSub === 'services') refreshServices();
            else refreshLogs();
          }}
          className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-medium transition"
        >
          刷新{activeSub === 'services' ? '进程状态' : '实时日志'}
        </button>
      </div>

      {activeSub === 'services' && (
        <div className="space-y-6">
          <div className="bg-[#0f172a] border border-gray-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-3 border-b border-gray-800 font-semibold text-xs text-gray-200">
              常驻核心守护进程 (macOS Core Daemons)
            </div>
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-gray-900/60 text-gray-400 border-b border-gray-800">
                <tr>
                  <th className="px-6 py-3">服务标识</th>
                  <th className="px-4 py-3">PID</th>
                  <th className="px-4 py-3">状态</th>
                  <th className="px-4 py-3">资源占用</th>
                  <th className="px-6 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {daemons.map((d, i) => (
                  <tr key={i} className="hover:bg-gray-800/40">
                    <td className="px-6 py-3">
                      <div className="text-cyan-300 font-sans font-medium">{d.name}</div>
                      <div className="text-[11px] text-gray-500">{d.service_name || '--'}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{d.pid || '--'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${d.is_running ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'}`}>
                        {d.is_running ? '正常运行中' : '已停止'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">CPU {d.cpu_pct?.toFixed(1) || 0}% / {d.mem_mb?.toFixed(1) || 0} MB</td>
                    <td className="px-6 py-3 text-right">
                      {d.service_name && (
                        <button
                          onClick={async () => {
                            await restartDaemon(d.service_name!);
                            refreshServices();
                          }}
                          className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/30 rounded text-[11px] transition"
                        >
                          安全重启
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-[#0f172a] border border-gray-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-3 border-b border-gray-800 font-semibold text-xs text-gray-200">
              量化审计与系统定时任务 (Crontab Matrix)
            </div>
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-gray-900/60 text-gray-400 border-b border-gray-800">
                <tr>
                  <th className="px-6 py-3">调度周期</th>
                  <th className="px-4 py-3">执行命令</th>
                  <th className="px-4 py-3">日志目标</th>
                  <th className="px-6 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {crontab.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-6 text-center text-gray-500 font-mono text-xs">
                      当前 macOS 运行环境采用常驻守护引擎内置调度，无传统 crontab 依赖
                    </td>
                  </tr>
                ) : (
                  crontab.map((c, i) => (
                    <tr key={i} className="hover:bg-gray-800/40">
                      <td className="px-6 py-3 text-cyan-400">{c.schedule}</td>
                      <td className="px-4 py-3 text-gray-300 truncate max-w-md">{c.command}</td>
                      <td className="px-4 py-3 text-gray-500 truncate max-w-xs">{c.log_path || '--'}</td>
                      <td className="px-6 py-3 text-right">
                        <button
                          onClick={async () => {
                            await runCrontabNow(c.command);
                            alert('已触发立即执行！');
                          }}
                          className="px-2.5 py-1 bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 rounded text-[11px]"
                        >
                          立即开跑
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSub === 'logs' && (
        <div className="space-y-3">
          {/* 日志通道切换工具栏 */}
          <div className="flex flex-wrap items-center gap-2 bg-gray-900/80 p-2 rounded-xl border border-gray-800">
            <span className="text-xs text-gray-400 font-medium px-2">日志通道:</span>
            {[
              { id: 'mc', label: '自媒体控制中枢 (8999)' },
              { id: 'tg', label: 'Telegram Bot 桥接' },
              { id: 'keeper', label: '系统守护巡检引擎' },
              { id: 'proxy', label: '代理健康监测自愈' },
              { id: 'lan', label: '局域网传输服务 (8888)' },
            ].map((ch) => (
              <button
                key={ch.id}
                onClick={() => setLogChannel(ch.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition ${
                  logChannel === ch.id
                    ? 'bg-cyan-600 text-white font-bold shadow'
                    : 'bg-gray-800/80 hover:bg-gray-800 text-gray-400 hover:text-gray-200'
                }`}
              >
                {ch.label}
              </button>
            ))}
          </div>

          <div className="bg-black/90 border border-gray-800 rounded-2xl p-4 font-mono text-xs text-gray-300 max-h-[600px] overflow-y-auto space-y-1">
            {logs.length === 0 ? (
              <div className="text-gray-500 py-8 text-center font-mono">
                当前通道暂无新日志输出
              </div>
            ) : (
              logs.map((line, idx) => (
                <div key={idx} className="whitespace-pre-wrap leading-relaxed hover:bg-gray-900/40 px-1 rounded">
                  {line}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
