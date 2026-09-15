import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 ring-1 ring-slate-200">
            <h1 className="text-lg font-semibold text-slate-900">Something went wrong</h1>
            <p className="mt-2 text-sm text-slate-600">
              {this.state.message ?? 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
