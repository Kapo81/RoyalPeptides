import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Home, RefreshCw, Copy, Check } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackRoute?: string;
  onNavigate?: (page: string) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      copied: false,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Error info:', errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
    });
  };

  handleNavigateHome = () => {
    const { onNavigate, fallbackRoute } = this.props;
    if (onNavigate) {
      onNavigate(fallbackRoute || 'home');
    } else if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  handleCopyError = async () => {
    const currentRoute = typeof window !== 'undefined' ? window.location.pathname : 'Unknown Route';
    const errorDetails = {
      route: currentRoute,
      message: this.state.error?.message || 'Unknown error',
      stack: this.state.error?.stack || 'No stack trace',
      componentStack: this.state.errorInfo?.componentStack || 'No component stack',
      timestamp: new Date().toISOString(),
    };

    const errorText = `Error Report
===============
Route: ${errorDetails.route}
Timestamp: ${errorDetails.timestamp}

Error Message:
${errorDetails.message}

Stack Trace:
${errorDetails.stack}

Component Stack:
${errorDetails.componentStack}
`;

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(errorText);
        this.setState({ copied: true });
        setTimeout(() => {
          this.setState({ copied: false });
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to copy error details:', err);
    }
  };

  render() {
    if (this.state.hasError) {
      const currentRoute = typeof window !== 'undefined' ? window.location.pathname : 'Unknown Route';

      return (
        <div className="min-h-screen bg-[#05070b] flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-gradient-to-br from-red-900/20 to-red-950/20 border border-red-500/30 rounded-xl p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-red-500/20 rounded-lg">
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white mb-2">
                  Something went wrong
                </h1>
                <p className="text-gray-400 text-sm mb-2">
                  An error occurred while rendering this page. The error details are shown below.
                </p>
                <p className="text-gray-500 text-xs">
                  Route: <span className="text-[#00A0E0] font-mono">{currentRoute}</span>
                </p>
              </div>
            </div>

            {this.state.error && (
              <div className="mb-6 bg-black/40 rounded-lg p-4 border border-white/10">
                <h2 className="text-sm font-semibold text-red-300 mb-2">Error Message:</h2>
                <p className="text-sm text-gray-300 font-mono break-words">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            {this.state.errorInfo && (
              <div className="mb-6 bg-black/40 rounded-lg p-4 border border-white/10 max-h-64 overflow-auto">
                <h2 className="text-sm font-semibold text-red-300 mb-2">Component Stack:</h2>
                <pre className="text-xs text-gray-400 font-mono whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00A0E0] to-[#11D0FF] text-white rounded-lg font-semibold hover:shadow-[0_0_30px_rgba(0,160,224,0.5)] transition-all duration-300"
              >
                <RefreshCw className="h-5 w-5" />
                Try Again
              </button>
              <button
                onClick={this.handleNavigateHome}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all border border-white/20"
              >
                <Home className="h-5 w-5" />
                Back to Store
              </button>
              <button
                onClick={this.handleCopyError}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 text-white rounded-lg font-semibold hover:bg-white/10 transition-all border border-white/10"
              >
                {this.state.copied ? (
                  <>
                    <Check className="h-5 w-5 text-green-400" />
                    <span className="text-green-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-5 w-5" />
                    Copy Details
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs text-gray-500">
                If this error persists, please contact support with the error details above. Use the "Copy Details" button to copy the full error report.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
