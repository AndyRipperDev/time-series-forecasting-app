import { Navigate } from 'react-router-dom'
import {} from 'state'
import { history } from 'helpers'
import { useUserService } from '../../services'

export { AdminRoute }

const AdminRoute = ({ children }) => {
  const userService = useUserService()

  if (!userService.isLoggedInUserAdmin()) {
    return <Navigate to="/home" state={{ from: history.location }} />
  }

  return children
}
