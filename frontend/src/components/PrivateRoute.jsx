import { Navigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { authAtom } from 'state';
import { history } from 'helpers';

export { PrivateRoute };

function PrivateRoute({ children }) {
  const auth = useRecoilValue(authAtom);

  if (!auth) {
    // not logged in so redirect to login page with the return url
    return <Navigate to="/login" state={{ from: history.location }} />
  }

  // authorized so return child components
  return children;
}