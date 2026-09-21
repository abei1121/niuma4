import { FunctionalComponent } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { SystemMetrics } from '../types/system';
import { getSystemMetrics } from '../api/system';

export const TabSystemOverview: FunctionalComponent = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const m = await getSystemMetrics();
      if (m) setMetrics(m);
    } catch (e) {
      console.error('获取硬件指标异常:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const ramUsedGb = metrics ? (metrics.memory_used_mb / 1024).toFixed(1) : '--';
  const ramTotalGb = metrics ? (metrics.memory_total_mb / 1024).toFixed(1) : '8.0';
  const ramFreeGb = metrics ? (metrics.memory_free_mb / 1024).toFixed(1) : '--';
  const ramPct = metrics && metrics.memory_total_mb > 0
    ? Math.round((metrics.memory_used_mb / metrics.memory_total_mb) * 100)
    : 0;

  const diskPct = metrics?.disk_used_pct ?? 0;
  const cpuModel = metrics?.cpu_model || 'Apple M2';
  const cpuCores = metrics?.cpu_cores || 8;

  return (
    <div className="space-y-6">
      {/* 顶部标题与说明 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <h2 className="text-base font-bold text-gray-100">Apple Mac mini M2 物理硬件规格</h2>
          <span className="text-xs text-gray-400 font-mono">Apple Silicon M2 · 8GB 统一内存 · macOS (Darwin ARM64)</span>
        </div>
        <button
          onClick={loadMetrics}
          disabled={loading}
          className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-semibold transition font-mono"
        >
          {loading ? '读取中...' : '↻ 刷新硬件实测'}
        </button>
      </div>

      {/* 四大物理硬件核心卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. CPU 物理硬件规格 */}
        <div className="bg-[#0f172a]/90 border border-gray-800 p-5 rounded-2xl shadow-xl space-y-3">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span className="font-bold">处理器物理规格 (CPU)</span>
            <span className="text-cyan-400 font-mono">{cpuCores} 核 (4P + 4E)</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold font-mono text-cyan-300">
              {cpuModel}
            </h3>
            <p className="text-[11px] text-gray-400 font-mono">8 核心 Apple Silicon 架构</p>
          </div>
          <div className="pt-2 border-t border-gray-800/80 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-400">微架构</span>
              <span className="text-gray-200">Apple ARM64 (5nm)</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-400">神经引擎</span>
              <span className="text-gray-200">16-core NPU</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-400">负载状态</span>
              <span className="text-emerald-400 font-bold">
                1m: {metrics?.load_avg_1m?.toFixed(2) ?? '0.00'}
              </span>
            </div>
          </div>
        </div>

        {/* 2. 物理内存容量指标 */}
        <div className="bg-[#0f172a]/90 border border-gray-800 p-5 rounded-2xl shadow-xl space-y-3">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span className="font-bold">统一内存 (Unified RAM)</span>
            <span className="text-emerald-400 font-mono">{ramPct}%</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold font-mono text-emerald-400">
              {ramUsedGb} <span className="text-xs text-gray-400 font-normal">/ {ramTotalGb} GB</span>
            </h3>
            <p className="text-[11px] text-gray-400 font-mono">剩余可用: {ramFreeGb} GB</p>
          </div>
          <div className="pt-2 border-t border-gray-800/80 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-400">架构类型</span>
              <span className="text-gray-200">LPDDR5 统一内存</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-400">内存带宽</span>
              <span className="text-gray-200">100 GB/s 超高速</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-400">保护机制</span>
              <span className="text-cyan-300 font-bold">8GB 防 Swap 守护</span>
            </div>
          </div>
        </div>

        {/* 3. 硬件编解码加速 GPU */}
        <div className="bg-[#0f172a]/90 border border-gray-800 p-5 rounded-2xl shadow-xl space-y-3">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span className="font-bold">图形与硬件编解码 (GPU)</span>
            <span className="text-amber-400 font-mono">VideoToolbox</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold font-mono text-amber-300">Apple M2 GPU</h3>
            <p className="text-[11px] text-gray-400 font-mono">10 核图形核心 + 硬件媒体引擎</p>
          </div>
          <div className="pt-2 border-t border-gray-800/80 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-400">驱动状态</span>
              <span className="text-emerald-400 font-bold">VideoToolbox 就绪</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-400">硬解/硬编</span>
              <span className="text-gray-200">H.264 / HEVC / ProRes</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-400">加速优势</span>
              <span className="text-amber-300 font-bold">近乎 0% CPU 极速压制</span>
            </div>
          </div>
        </div>

        {/* 4. 固态磁盘存储 */}
        <div className="bg-[#0f172a]/90 border border-gray-800 p-5 rounded-2xl shadow-xl space-y-3">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span className="font-bold">高速系统固态存储 (SSD)</span>
            <span className="text-purple-400 font-mono">{diskPct}%</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold font-mono text-purple-400">
              {metrics?.disk_used_gb ?? '--'} <span className="text-xs text-gray-400 font-normal">/ {metrics?.disk_total_gb ?? '--'} GB</span>
            </h3>
            <p className="text-[11px] text-gray-400 font-mono">可用空间: {metrics?.disk_avail_gb ?? '--'} GB</p>
          </div>
          <div className="pt-2 border-t border-gray-800/80 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-400">分区挂载</span>
              <span className="text-gray-200">APFS 容器</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-400">文件系统</span>
              <span className="text-gray-200">Apple APFS 日志型</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-400">存储健康</span>
              <span className="text-emerald-400 font-bold">空间充裕</span>
            </div>
          </div>
        </div>
      </div>

      {/* 底部物理系统信息 */}
      <div className="bg-[#0f172a]/90 border border-gray-800 p-4 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center space-x-6">
          <div>
            <span className="text-gray-500 block text-[10px]">开机运行周期</span>
            <span className="text-gray-200 font-bold">
              {metrics ? `${metrics.uptime_hours.toFixed(1)} 小时` : '--'}
            </span>
          </div>
          <div className="border-l border-gray-800 pl-6">
            <span className="text-gray-500 block text-[10px]">操作系统与内核</span>
            <span className="text-gray-200 font-bold">macOS (Darwin ARM64 / Apple Silicon)</span>
          </div>
          <div className="border-l border-gray-800 pl-6">
            <span className="text-gray-500 block text-[10px]">硬件能效模式</span>
            <span className="text-emerald-400 font-bold">M2 高能效超静音</span>
          </div>
        </div>
        <div className="text-gray-500 text-[11px]">
          专属工作区: /Users/hi/niuma
        </div>
      </div>
    </div>
  );
};
