import {
  Route,
  Routes,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom'
import LoginPage from './pages/LoginSignup/LoginPage'
import SignUpPage from './pages/LoginSignup/SignUpPage'
import HomePage from './pages/Home/HomePage'
import { Nav, PrivateRoute } from 'components'
import { history } from 'helpers'
import ContentPage from './components/PageLayouts/ContentPage'
import { useThemeActions } from './actions'
import { useEffect } from 'react'
import { Alert } from './components/Alert'
import SettingsPage from './pages/Settings/SettingsPage'
import ProjectsPage from './pages/Projects/ProjectsPage'
import GeneralSettingsPage from './pages/Settings/General/GeneralSettingsPage'
import UsersManagePage from './pages/Settings/Users/UsersManagePage'
import RolesManagePage from './pages/Settings/Roles/RolesManagePage'
import { AdminRoute } from './components/Nav/AdminRoute'
import { UserAddEditPage } from './pages/Settings/Users/UserAddEditPage'
import { RoleAddEditPage } from './pages/Settings/Roles/RoleAddEditPage'
import { ProjectAddEditPage } from './pages/Projects/ProjectAddEditPage'
import ProjectDetailsPage from './pages/Projects/ProjectDetailsPage'
import ProjectCheckDatasetColumnsPage from './pages/Projects/ProjectCheckDatasetColumnsPage'
import { ProjectDetailsColumnPlotsPage } from './pages/Projects/ProjectDetailsColumnPlotsPage'
import ForecastSettingsPage from './pages/Projects/ForecastSettingsPage'
import ForecastingPage from './pages/Forecasting/ForecastingPage'
import ForecastingDetailsPage from './pages/Forecasting/ForecastingDetailsPage'

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
            path="/settings/general"
            element={
              <PrivateRoute>
                <GeneralSettingsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings/users"
            element={
              <AdminRoute>
                <UsersManagePage />
              </AdminRoute>
            }
          />
          <Route
            path="/settings/users/add"
            element={
              <AdminRoute>
                <UserAddEditPage />
              </AdminRoute>
            }
          />
          <Route
            path="/settings/users/edit/:id"
            element={
              <AdminRoute>
                <UserAddEditPage />
              </AdminRoute>
            }
          />
          <Route
            path="/settings/roles"
            element={
              <AdminRoute>
                <RolesManagePage />
              </AdminRoute>
            }
          />
          <Route
            path="/settings/roles/add"
            element={
              <AdminRoute>
                <RoleAddEditPage />
              </AdminRoute>
            }
          />
          <Route
            path="/settings/roles/edit/:id"
            element={
              <AdminRoute>
                <RoleAddEditPage />
              </AdminRoute>
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
            path="/projects/:id"
            element={
              <PrivateRoute>
                <ProjectDetailsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/projects/:id/columns-view"
            element={
              <PrivateRoute>
                <ProjectDetailsColumnPlotsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/projects/add"
            element={
              <PrivateRoute>
                <ProjectAddEditPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/projects/:id/columns-check"
            element={
              <PrivateRoute>
                <ProjectCheckDatasetColumnsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/projects/edit/:id"
            element={
              <PrivateRoute>
                <ProjectAddEditPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/projects/:id/forecast-settings"
            element={
              <PrivateRoute>
                <ForecastSettingsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/forecasting"
            element={
              <PrivateRoute>
                <ForecastingPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/forecasting/:id"
            element={
              <PrivateRoute>
                <ForecastingDetailsPage />
              </PrivateRoute>
            }
          />
          {/*<Route*/}
          {/*  path="/dashboard"*/}
          {/*  element={*/}
          {/*    <PrivateRoute>*/}
          {/*      <DashboardPage />*/}
          {/*    </PrivateRoute>*/}
          {/*  }*/}
          {/*/>*/}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </ContentPage>
    </div>
  )
}

export default App
