import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'
import { useRecoilValue } from 'recoil'

import { userAtom } from '../../../state'
import { useAlertActions } from '../../../actions'
import { useUserService } from '../../../services'
import FormInput from '../../../components/FormInput'
import BasicForm from '../../../components/Forms/BasicForm'
import LoadingPage from '../../../components/Loadings/LoadingPage'
import { history } from '../../../helpers'

export { UserAddEditPage }

function UserAddEditPage() {
  const { id } = useParams()
  const mode = { add: !id, edit: !!id }
  const userService = useUserService()
  const alertActions = useAlertActions()
  const user = useRecoilValue(userAtom)

  // form validation rules
  const validationSchema = Yup.object().shape({
    full_name: Yup.string().required('Full Name is required'),
    email: Yup.string()
      .required('Email is required')
      .email('Enter a valid email'),
    password: Yup.string()
      .transform((x) => (x === '' ? undefined : x))
      .concat(mode.add ? Yup.string().required('Password is required') : null)
      .min(6, 'Password must be at least 6 characters'),
  })

  const formOptions = { resolver: yupResolver(validationSchema) }

  // get functions to build form with useForm() hook
  const { register, handleSubmit, reset, formState } = useForm(formOptions)
  const { errors, isSubmitting } = formState

  useEffect(() => {
    // fetch user details into recoil state in edit mode
    if (mode.edit) {
      userService.getById(id)
    }
    return userService.resetUser

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // set default form values after user set in recoil state (in edit mode)
    if (mode.edit && user) {
      reset(user)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  function onSubmit(data) {
    return mode.add ? createUser(data) : updateUser(user.id, data)
  }

  function createUser(data) {
    return userService.create(data).then(() => {
      history.navigate('/settings/users')
      alertActions.success('User added')
    })
  }

  function updateUser(id, data) {
    if (data?.password?.trim() === '') {
      data.password = null
    }

    return userService.update(id, data).then(() => {
      history.navigate('/settings/users')
      alertActions.success('User updated')
    })
  }

  const loading = mode.edit && !user
  return (
    <>
      {!loading && (
        <div className="grid h-screen place-items-center text-center">
          <BasicForm
            onSubmit={handleSubmit(onSubmit)}
            isSubmitting={isSubmitting}
            heading={mode.add ? 'Create User' : 'Edit User'}
            action={mode.add ? 'Create' : 'Save'}
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
              label={'Active'}
              type={'checkbox'}
              name={'is_active'}
              forId={'isActiveId'}
              registerHookForm={register('is_active')}
              errorMessage={errors.is_active?.message}
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
            {mode.edit && (
              <em className="ml-1 text-left">
                (Leave blank to keep the same password)
              </em>
            )}
          </BasicForm>
        </div>
      )}
      {loading && <LoadingPage />}
    </>
  )
}
