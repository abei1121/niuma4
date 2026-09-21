import { FunctionalComponent } from 'preact';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: FunctionalComponent<NavbarProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const tabs = [
    { id: 'video-studio', label: '视频剪辑中枢' },
    { id: 'media-library', label: '媒体资产库' },
    { id: 'gemini', label: '大模型矩阵' },
    { id: 'subagents', label: '特战子代理' },
    { id: 'wiki-skills', label: '技能与知识库' },
    { id: 'file-transfer', label: '局域网传输' },
    { id: 'services-logs', label: '常驻守护与日志' },
    { id: 'system', label: '硬件指标' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#080c14]/90 backdrop-blur-md border-b border-gray-800 px-6 py-3">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h1 className="text-base font-bold tracking-wide text-gray-100">
            小韭菜牧场剪辑牛马 <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">牛马4号 · 视频剪辑中枢</span>
          </h1>
        </div>

        <nav className="flex items-center flex-wrap gap-1 bg-gray-900/90 p-1 rounded-xl border border-gray-800 shadow-inner">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition duration-150 flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-950 font-bold'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }`}
              >
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
