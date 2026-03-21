import { Navigate, Route, Routes } from 'react-router-dom';

import LoadingScreen from './components/LoadingScreen';
import NoticeBanner from './components/NoticeBanner';
import RequireAuth from './components/RequireAuth';
import useAppState from './hooks/useAppState';
import AiPlaylistPage from './pages/AiPlaylistPage';
import AlbumPage from './pages/AlbumPage';
import AlbumsPage from './pages/AlbumsPage';
import DownloadsPage from './pages/DownloadsPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';

function App() {
  const appState = useAppState();

  if (appState.sessionStatus === 'loading') {
    return <LoadingScreen />;
  }

  return (
    <>
      <NoticeBanner notice={appState.notice} onDismiss={appState.clearNotice} />
      <Routes>
        <Route
          path="/login"
          element={
            appState.sessionStatus === 'ready'
              ? <Navigate to="/" replace />
              : <LoginPage />
          }
        />
        <Route
          path="/"
          element={(
            <RequireAuth sessionStatus={appState.sessionStatus}>
              <HomePage appState={appState} />
            </RequireAuth>
          )}
        />
        <Route
          path="/artist/:artistId/albums"
          element={(
            <RequireAuth sessionStatus={appState.sessionStatus}>
              <AlbumsPage appState={appState} />
            </RequireAuth>
          )}
        />
        <Route
          path="/album/:albumId"
          element={(
            <RequireAuth sessionStatus={appState.sessionStatus}>
              <AlbumPage appState={appState} />
            </RequireAuth>
          )}
        />
        <Route
          path="/downloads"
          element={(
            <RequireAuth sessionStatus={appState.sessionStatus}>
              <DownloadsPage appState={appState} />
            </RequireAuth>
          )}
        />
        <Route
          path="/ai-playlist"
          element={(
            <RequireAuth sessionStatus={appState.sessionStatus}>
              <AiPlaylistPage appState={appState} />
            </RequireAuth>
          )}
        />
        <Route
          path="*"
          element={<Navigate to={appState.sessionStatus === 'ready' ? '/' : '/login'} replace />}
        />
      </Routes>
    </>
  );
}

export default App;
