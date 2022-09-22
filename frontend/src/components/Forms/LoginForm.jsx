import { Link } from 'react-router-dom'
import { useUserService } from 'services'
import FormInput from '../FormInput'
import BasicForm from './BasicForm'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'

// function LoginForm({ history, submit, label }) {
const LoginForm = () => {
  const userService = useUserService()

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .required('Email is required')
      .email('Enter a valid email'),
    password: Yup.string().required('Password is required'),
  })
  const formOptions = { resolver: yupResolver(validationSchema) }

  const { register, handleSubmit, setError, formState } = useForm(formOptions)
  const { errors, isSubmitting } = formState

  function onSubmit({ email, password }) {
    return userService.login(email, password)
  }

  return (
    <BasicForm
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      heading={'Log In'}
      action={'Log In'}
      details={
        <p>
          Don't have an account yet?{' '}
          <Link to="/signup" className="link link-primary">
            Sign Up Here
          </Link>
        </p>
      }
    >
      <FormInput
        label={'E-Mail'}
        type={'email'}
        name={'email'}
        forId={'emailId'}
        registerHookForm={register('email')}
        errorMessage={errors.email?.message}
      />
      <FormInput
        label={'Password'}
        type={'password'}
        name={'password'}
        forId={'passwordId'}
        registerHookForm={register('password')}
        errorMessage={errors.password?.message}
      />
    </BasicForm>
  )
}

export default LoginForm
