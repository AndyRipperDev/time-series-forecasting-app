import TextInput from './TextInput'
import { Link } from 'react-router-dom'

function SignUpForm() {
  return (
    <div className="w-96">
      <div className="card w-96 bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="text-center text-2xl font-bold mb-8">Sign Up</h2>
          <TextInput label={'First Name'} type={'text'} forId={'firstNameId'} />
          <TextInput label={'Last Name'} type={'text'} forId={'lastNameId'} />
          <TextInput label={'E-Mail'} type={'email'} forId={'emailId'} />
          <TextInput
            label={'Password'}
            type={'password'}
            forId={'passwordId'}
          />
          <TextInput
            label={'Password Again'}
            type={'password'}
            forId={'passwordCheckId'}
          />
          <div className="card-actions mt-16">
            <button className="btn btn-primary btn-block">Sign Up</button>
            <p className="text-center mt-16">
              Already have an account?{' '}
              <Link to="/login" className="link link-primary">
                Login Here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUpForm
