import { Component, ComponentChildren } from 'preact';

interface Props {
  children: ComponentChildren;
  fallbackTitle?: string;
  activeKey?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary 捕获局部渲染异常:', error, errorInfo);
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.activeKey !== this.props.activeKey && this.state.hasError) {
      this.setState({ hasError: false, error: undefined });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-[#0f172a] border border-rose-900/50 rounded-2xl p-6 text-center space-y-3 shadow-xl my-4">
          <div className="flex items-center justify-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="text-rose-400 font-bold text-sm">
              {this.props.fallbackTitle || '当前页面加载异常'}
            </span>
          </div>
          <p className="text-xs text-gray-400 font-mono max-w-xl mx-auto truncate bg-gray-950/80 p-2.5 rounded-lg border border-gray-800">
            {this.state.error?.message || '未知错误'}
          </p>
          <div className="flex justify-center space-x-3 pt-2">
            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="px-4 py-1.5 bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/40 rounded-lg text-xs font-semibold transition"
            >
              重新加载本模块
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
