import LoginForm from '../components/Forms/LoginForm'
import { useEffect } from 'react'
import { useRecoilValue } from 'recoil'
import { authAtom } from '../state'
import { useNavigate } from 'react-router-dom'
import CenteredPage from '../components/PageLayouts/CenteredPage'

const LoginPage = () => {
  const auth = useRecoilValue(authAtom)
  const navigate = useNavigate()
  useEffect(() => {
    if (auth) navigate('/')
  }, [auth, navigate])

  return (
    <CenteredPage>
      <LoginForm />
    </CenteredPage>
  )
}

export default LoginPage
