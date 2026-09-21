import { FunctionalComponent } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { listProjects, saveProject, loadProject, ProjectSummary } from '../../api/video';

interface Props {
  projectName: string;
  onUpdateProjectName: (name: string) => void;
  onNewProject: () => void;
  getCurrentProjectData: () => any;
  onLoadProjectData: (name: string, data: any) => void;
}

export const ProjectHeader: FunctionalComponent<Props> = ({
  projectName,
  onUpdateProjectName,
  onNewProject,
  getCurrentProjectData,
  onLoadProjectData,
}) => {
  const [projectList, setProjectList] = useState<ProjectSummary[]>([]);
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [showLoadDropdown, setShowLoadDropdown] = useState(false);

  const refreshList = async () => {
    try {
      const list = await listProjects();
      setProjectList(list);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    refreshList();
  }, []);

  const handleSave = async () => {
    if (!projectName.trim()) {
      alert('请先输入项目名称');
      return;
    }
    setSaveStatus('正在保存...');
    try {
      const data = getCurrentProjectData();
      await saveProject(projectName.trim(), data);
      setSaveStatus('已持久化保存！');
      refreshList();
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (e) {
      setSaveStatus('保存失败');
      alert('保存工程失败: ' + e);
    }
  };

  const handleSelectProject = async (name: string) => {
    try {
      const res = await loadProject(name);
      if (res.success && res.project) {
        onLoadProjectData(res.project.name, res.project.data);
        setShowLoadDropdown(false);
      } else {
        alert('读取工程失败: ' + res.error);
      }
    } catch (e) {
      alert('加载异常: ' + e);
    }
  };

  return (
    <div className="bg-[#0b1120] border border-gray-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-lg">
      <div className="flex items-center space-x-3 flex-1 min-w-[280px]">
        <div className="flex items-center space-x-1.5 text-xs text-gray-400 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>当前剪辑项目:</span>
        </div>
        <input
          type="text"
          value={projectName}
          onInput={(e: any) => onUpdateProjectName(e.target.value)}
          placeholder="输入项目自定义名称..."
          className="flex-1 bg-gray-950 border border-gray-700 focus:border-cyan-500 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-100 placeholder-gray-500 transition font-mono"
        />
        {saveStatus && (
          <span className="text-[11px] font-mono text-emerald-400 animate-pulse">{saveStatus}</span>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {/* 新建项目按钮 */}
        <button
          onClick={onNewProject}
          className="px-3 py-1.5 bg-cyan-600/30 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-bold transition flex items-center space-x-1"
        >
          <span>创建新项目</span>
        </button>

        {/* 保存工程 */}
        <button
          onClick={handleSave}
          className="px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-bold transition flex items-center space-x-1"
        >
          <span>保存工程</span>
        </button>

        {/* 载入已有项目 */}
        <div className="relative">
          <button
            onClick={() => {
              setShowLoadDropdown(!showLoadDropdown);
              if (!showLoadDropdown) refreshList();
            }}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 rounded-lg text-xs font-bold transition flex items-center space-x-1"
          >
            <span>已有工程 ({projectList.length}) ▾</span>
          </button>

          {showLoadDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-gray-950 border border-gray-700 rounded-xl shadow-2xl z-50 p-2 text-xs space-y-1 max-h-56 overflow-y-auto">
              {projectList.length === 0 ? (
                <div className="text-gray-500 p-2 text-center text-[11px]">暂无已保存的历史工程</div>
              ) : (
                projectList.map((p) => (
                  <div
                    key={p.name}
                    onClick={() => handleSelectProject(p.name)}
                    className="p-2 hover:bg-gray-800 rounded cursor-pointer transition text-gray-300 flex justify-between items-center"
                  >
                    <span className="font-mono truncate flex-1 font-bold">{p.name}</span>
                    <span className="text-[10px] text-gray-500 ml-2 font-mono">{p.file}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
