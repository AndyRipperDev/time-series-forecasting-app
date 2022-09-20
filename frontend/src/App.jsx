import {
  Route,
  Routes,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import HomePage from './pages/HomePage'
import { Nav, PrivateRoute } from 'components'
import { history } from 'helpers'
import ContentPage from './components/PageLayouts/ContentPage'
import { useThemeActions } from './actions'
import { useEffect } from 'react'
import { Alert } from './components/Alert'
import SettingsPage from './pages/SettingsPage'
import ProjectsPage from './pages/ProjectsPage'
import DashboardPage from './pages/DashboardPage'

function App() {
  history.navigate = useNavigate()
  history.location = useLocation()
  const themeActions = useThemeActions()
  useEffect(() => {
    themeActions.initTheme()
  }, [themeActions])

  return (
    <div className="App flex bg-base-300 w-full h-full fixed">
      <Nav className="flex-none" />
      <ContentPage className="flex-auto">
        <Alert />
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <SettingsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <PrivateRoute>
                <ProjectsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </ContentPage>
    </div>
  )
}

export default App
