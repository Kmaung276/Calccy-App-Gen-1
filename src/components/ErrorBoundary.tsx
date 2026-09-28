import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AuraCalc Error Boundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-screen flex items-center justify-center p-6 bg-slate-950 text-white text-center">
          <div className="max-w-md p-6 rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-xl font-bold">
              !
            </div>
            <h2 className="text-lg font-semibold">Calculator Recovered</h2>
            <p className="text-xs text-white/60">
              A temporary display error occurred. Click below to refresh the calculator safely.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="px-5 py-2 text-xs font-semibold rounded-full bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all cursor-pointer shadow-lg"
            >
              Restart Calculator
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
