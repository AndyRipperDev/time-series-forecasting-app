import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'
import { useRecoilValue } from 'recoil'

import { authAtom, userAtom } from '../../../state'
import { useAlertActions } from '../../../actions'
import { useUserService } from '../../../services'
import FormInput from '../../../components/FormInput'
import BasicForm from '../../../components/Forms/BasicForm'
import LoadingPage from '../../../components/Loadings/LoadingPage'
import { history } from '../../../helpers'
import Loading from '../../../components/Loadings/Loading'

export { EditAccountPage }

function EditAccountPage() {
  const userService = useUserService()
  const user = useRecoilValue(userAtom)
  const auth = useRecoilValue(authAtom)

  if(!auth) {
    history.navigate('/settings/general')
  }

  // form validation rules
  const validationSchema = Yup.object().shape({
    full_name: Yup.string().required('Full Name is required'),
    email: Yup.string()
      .required('Email is required')
      .email('Enter a valid email'),
    password: Yup.string()
      .transform((x) => (x === '' ? undefined : x))
      .min(6, 'Password must be at least 6 characters'),
  })

  const formOptions = { resolver: yupResolver(validationSchema) }

  // get functions to build form with useForm() hook
  const { register, handleSubmit, reset, formState } = useForm(formOptions)
  const { errors, isSubmitting } = formState

  useEffect(() => {
    // fetch user details into recoil state in edit mode
    userService.getById(auth.user.id)

    return userService.resetUser

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // set default form values after user set in recoil state (in edit mode)
    if (user) {
      reset(user)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  function onSubmit(data) {
    return updateUser(user.id, data)
  }

  function updateUser(id, data) {
    if (data?.password?.trim() === '') {
      data.password = null
    }

    return userService.update(id, data).then(() => {
      history.navigate('/settings/general')
    })
  }

  const loading = !user
  return (
    <>
      {!loading && (
        <div className="grid h-screen place-items-center text-center">
          <BasicForm
            onSubmit={handleSubmit(onSubmit)}
            isSubmitting={isSubmitting}
            heading={'Edit Account'}
            action={'Save'}
          >
            <FormInput
              label={'Full Name'}
              type={'text'}
              name={'full_name'}
              forId={'fullNameId'}
              registerHookForm={register('full_name')}
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
            <em className="ml-1 text-left">
              (Leave blank to keep the same password)
            </em>
          </BasicForm>
        </div>
      )}
      {loading && <LoadingPage />}
    </>
  )
}
