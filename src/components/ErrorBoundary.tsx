import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  public state: ErrorBoundaryState = {
    hasError: false,
    message: '',
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'An unexpected error occurred.',
    };
  }

  public componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Application error boundary caught:', error, info);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-screen bg-[#132219] text-[#FAF3DF] flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-2xl bg-[#16291D] border border-[#F2E0A8]/20 p-6 text-center shadow-2xl">
            <h1 className="font-display text-2xl font-bold">
              Something went wrong
            </h1>
            <p className="text-sm text-[#C6D6BD] mt-2 break-words">
              {this.state.message}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 px-5 py-2.5 rounded-xl bg-gradient-to-b from-[#E7B14A] to-[#C88B28] text-[#1F1507] font-semibold text-sm hover:brightness-105 transition-all"
            >
              Reload Game
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
