import { Component, type ReactNode } from 'react';
import { KEYS, remove } from '../lib/storage';

interface State {
  error: Error | null;
}

/** Last-resort fallback so a rendering bug never leaves a blank screen. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="mx-auto max-w-lg px-4 pt-24 text-center">
        <p className="hud-label text-bad">System fault</p>
        <h1 className="mt-2 font-display text-3xl font-bold">Something went wrong</h1>
        <p className="mt-3 text-ink-muted">Your history is safe. Reload to get back to the console.</p>
        <button
          type="button"
          className="btn-primary mt-6"
          onClick={() => {
            remove(KEYS.session);
            location.reload();
          }}
        >
          Reload
        </button>
      </div>
    );
  }
}
