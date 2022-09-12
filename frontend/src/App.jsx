import { Route, Routes, Navigate, useNavigate, useLocation } from 'react-router-dom'
import LoginPage from './components/LoginPage'
import SignUpPage from './components/SignUpPage'
import Page from './components/Page'
import { Nav, PrivateRoute } from 'components';
import { history } from 'helpers';
import ContentPage from './components/ContentPage'
import { useThemeActions } from './actions'
import { useEffect } from 'react'
import { Alert } from './components/Alert'


function App() {
  history.navigate = useNavigate();
  history.location = useLocation();
  const themeActions = useThemeActions();
  useEffect(() => {
    themeActions.initTheme()
  }, [themeActions]);

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
                <Page />
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<LoginPage/>} />
          <Route path="/signup" element={<SignUpPage/>} />
          <Route path="*" element={<Navigate to ="/" />}/>
        </Routes>
      </ContentPage>
    </div>
  )
}

export default App
