import { Navigate } from 'react-router-dom'
import { useRecoilValue } from 'recoil'

import { authAtom } from 'state'
import { history } from 'helpers'

export { PrivateRoute }

const PrivateRoute = ({ children }) => {
  const auth = useRecoilValue(authAtom)

  if (!auth) {
    return <Navigate to="/login" state={{ from: history.location }} />
  }

  return children
}
