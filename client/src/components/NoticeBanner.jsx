import { useEffect } from 'react';

function NoticeBanner({ notice, onDismiss }) {
  useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timeoutId = window.setTimeout(onDismiss, 5000);
    return () => window.clearTimeout(timeoutId);
  }, [notice, onDismiss]);

  if (!notice) {
    return null;
  }

  return (
    <div className="notice-shell">
      <div className="notice-banner" role="alert">
        <span>{notice}</span>
        <button type="button" className="notice-dismiss" onClick={onDismiss} aria-label="Dismiss message">
          Close
        </button>
      </div>
    </div>
  );
}

export default NoticeBanner;
