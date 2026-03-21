import TopNav from './TopNav';

function AppShell({ user, title, description, activeView, children, topSlot }) {
  const avatarAlt = user?.displayName || user?.email || 'Signed in user';

  return (
    <div className="shell">
      <section className={activeView === 'home' ? 'hero' : 'page'}>
        <div className="session-bar">
          <div className="session-user">
            {user?.avatarUrl ? <img src={user.avatarUrl} alt={avatarAlt} /> : null}
            <span>{user?.displayName || user?.email}</span>
          </div>
          <form method="POST" action="/auth/logout">
            <button type="submit" className="secondary">Log Out</button>
          </form>
        </div>
        <div className="page-head">
          <div>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          <TopNav activeView={activeView} />
        </div>
        {topSlot}
        {children}
      </section>
    </div>
  );
}

export default AppShell;
