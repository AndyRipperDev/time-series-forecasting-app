import LoginPage from './components/LoginPage'
import SignUpPage from './components/SignUpPage'
import Page from './components/Page'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Page />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignUpPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
