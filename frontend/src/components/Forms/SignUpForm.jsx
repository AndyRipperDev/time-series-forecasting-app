import { Link } from 'react-router-dom'
import FormInput from '../FormInput'
import { useUserService } from '../../services'
import BasicForm from './BasicForm'
import * as Yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup/dist/yup'
import { useForm } from 'react-hook-form'

const SignUpForm = () => {
  const userService = useUserService()

  const validationSchema = Yup.object().shape({
    fullName: Yup.string().required('Full Name is required'),
    email: Yup.string()
      .required('Email is required')
      .email('Enter a valid email'),
    password: Yup.string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters'),
  })
  const formOptions = { resolver: yupResolver(validationSchema) }

  const { register, handleSubmit, setError, formState } = useForm(formOptions)
  const { errors, isSubmitting } = formState

  function onSubmit(data) {
    return userService.signup(data)
  }

  return (
    <BasicForm
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      heading={'Sign Up'}
      action={'Sign Up'}
      details={
        <p>
          Already have an account?{' '}
          <Link to="/login" className="link link-primary">
            Log In Here
          </Link>
        </p>
      }
    >
      <FormInput
        label={'Full Name'}
        type={'text'}
        name={'fullName'}
        forId={'fullNameId'}
        registerHookForm={register('fullName')}
        errorMessage={errors.fullName?.message}
      />
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

export default SignUpForm
