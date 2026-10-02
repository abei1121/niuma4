// web_frontend/src/components/ziwei/DevHotReloadViewer.tsx - Hot Reload & Dev Guide (<= 250 lines)
import { FunctionalComponent } from 'preact';

export const DevHotReloadViewer: FunctionalComponent = () => {
  return (
    <div className="bg-[#0b101b] border border-gray-800 p-5 rounded-2xl space-y-4 text-xs">
      <h3 className="font-bold text-sm text-emerald-300">
        局域网面板热加载（Hot Reload）机制说明
      </h3>
      <p className="text-gray-300 leading-relaxed">
        关于在面板上是否可以热加载：
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-2">
          <h4 className="font-bold text-amber-400">方式一：秒级磁盘直读构建 (推荐)</h4>
          <p className="text-gray-400 leading-relaxed">
            目前后端的静态服务已配置为优先从磁盘读取产物。你在 Mac 终端执行：
          </p>
          <div className="bg-black p-2 rounded text-emerald-400 font-mono text-[11px]">
            cd /Users/hi/niuma/niuma1-main/projects/poly_mission_control/web_frontend<br/>
            npm run build
          </div>
          <p className="text-gray-400 leading-relaxed">
            构建仅耗时 1 秒，完成后直接刷新浏览器 <code className="text-amber-300">http://192.168.1.3:8999/</code>，即可立即看到最新代码，<strong>完全不需要重启 Rust 后端服务或重新编译二进制</strong>！
          </p>
        </div>

        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 space-y-2">
          <h4 className="font-bold text-cyan-400">方式二：Vite 原生 HMR 热重载 (极致体验)</h4>
          <p className="text-gray-400 leading-relaxed">
            如果你正在频繁修改 UI 界面，想要修改代码后 50ms 内页面自动热替换：
          </p>
          <div className="bg-black p-2 rounded text-cyan-400 font-mono text-[11px]">
            cd /Users/hi/niuma/niuma1-main/projects/poly_mission_control/web_frontend<br/>
            npm run dev
          </div>
          <p className="text-gray-400 leading-relaxed">
            打开 <code className="text-cyan-300">http://192.168.1.3:5173/</code>，保存代码的瞬间即可无感热更新！
          </p>
        </div>
      </div>
    </div>
  );
};
