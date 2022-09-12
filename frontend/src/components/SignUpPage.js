import SignUpForm from './SignUpForm'
import { useEffect } from 'react'
import { useRecoilValue } from 'recoil'
import { authAtom } from '../state'
import {useNavigate} from 'react-router-dom';
import CenteredPage from './CenteredPage'


function SignUpPage() {
  const auth = useRecoilValue(authAtom);
  const navigate = useNavigate();
  useEffect(() => {
    if (auth) navigate('/');
  }, [auth, navigate]);

  return (
    <CenteredPage>
      <SignUpForm />
    </CenteredPage>
  )
}

export default SignUpPage
