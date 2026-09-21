import { FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';
import { Navbar } from './components/Navbar';
import { TabVideoStudio } from './components/TabVideoStudio';
import { TabMediaLibrary } from './components/TabMediaLibrary';
import { TabGeminiAccounts } from './components/TabGeminiAccounts';
import { TabSubagents } from './components/TabSubagents';
import { TabWikiSkills } from './components/TabWikiSkills';
import { TabFileTransfer } from './components/TabFileTransfer';
import { TabServicesLogs } from './components/TabServicesLogs';
import { TabSystemOverview } from './components/TabSystemOverview';
import { ErrorBoundary } from './components/ErrorBoundary';

export const App: FunctionalComponent = () => {
  const [activeTab, setActiveTab] = useState('video-studio');

  return (
    <div className="min-h-screen flex flex-col bg-[#080c14] text-gray-100">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="flex-1 px-6 py-6 w-full max-w-[1920px] mx-auto">
        <ErrorBoundary key={activeTab} activeKey={activeTab} fallbackTitle="当前页面加载异常">
          {activeTab === 'video-studio' && <TabVideoStudio />}
          {activeTab === 'media-library' && <TabMediaLibrary />}
          {activeTab === 'gemini' && <TabGeminiAccounts />}
          {activeTab === 'subagents' && <TabSubagents />}
          {activeTab === 'wiki-skills' && <TabWikiSkills />}
          {activeTab === 'file-transfer' && <TabFileTransfer />}
          {activeTab === 'services-logs' && <TabServicesLogs />}
          {activeTab === 'system' && <TabSystemOverview />}
        </ErrorBoundary>
      </main>
    </div>
  );
};
