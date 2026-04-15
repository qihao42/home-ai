import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  readonly children: ReactNode
  readonly fallback?: (error: Error, reset: () => void) => ReactNode
}

interface State {
  error: Error | null
}

/**
 * Catches any render error thrown by a descendant and shows a recovery UI
 * instead of blanking the entire app. The user can dismiss and continue.
 */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary] caught:', error, info.componentStack)
  }

  private reset = (): void => {
    this.setState({ error: null })
  }

  override render(): ReactNode {
    if (this.state.error !== null) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset)
      }
      return (
        <div className="flex min-h-[50vh] items-center justify-center p-6">
          <div
            className="max-w-md rounded-2xl border p-6 text-center"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-strong)' }}
          >
            <div className="text-4xl mb-3">💥</div>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Something went wrong
            </h2>
            <p className="text-sm mb-4 break-words" style={{ color: 'var(--text-secondary)' }}>
              {this.state.error.message || 'Unknown error'}
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={this.reset}
                className="rounded-lg bg-blue-500/20 border border-blue-500/40 px-4 py-2 text-sm font-medium text-blue-300 hover:bg-blue-500/30"
              >
                Try again
              </button>
              <button
                onClick={() => {
                  window.location.hash = 'dashboard'
                  this.reset()
                }}
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:opacity-80"
                style={{ borderColor: 'var(--border-strong)', color: 'var(--text-primary)' }}
              >
                Go home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
