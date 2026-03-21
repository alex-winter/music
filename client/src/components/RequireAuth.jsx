import { Navigate } from 'react-router-dom';

function RequireAuth({ children, sessionStatus }) {
  if (sessionStatus !== 'ready') {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default RequireAuth;
