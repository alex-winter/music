import { useLocation } from 'react-router-dom';

function LoginPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const error = params.get('error');

  return (
    <div className="shell login-shell">
      <section className="login-hero">
        <div className="eyebrow">Personal Music Workspace</div>
        <h1>Search, collect, and build playlists without the giant HTML file.</h1>
        <p className="hero-copy">
          Waveform now runs on a component-based frontend, so the product can keep growing without the UI logic turning into one long document.
        </p>
        <div className="hero-actions">
          <a className="button-link" href="/auth/google">Continue With Google</a>
        </div>
        {error ? (
          <div className="error-banner">Google sign-in failed. Please try again.</div>
        ) : null}
      </section>
    </div>
  );
}

export default LoginPage;
