import TextInput from './TextInput'
import { Link } from 'react-router-dom'

function LoginForm() {
  return (
    <div className="w-96">
      <div className="card w-96 bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="text-center text-2xl font-bold mb-8">Login</h2>
          <TextInput label={'E-Mail'} type={'email'} forId={'emailId'} />
          <TextInput
            label={'Password'}
            type={'password'}
            forId={'passwordId'}
          />
          <div className="card-actions mt-16">
            <button className="btn btn-primary btn-block">Login</button>
            <p className="text-center mt-16">
              Don't have an account yet?{' '}
              <Link to="/signup" className="link link-primary">
                Sign Up Here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginForm
