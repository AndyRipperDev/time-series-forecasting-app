import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'
import { useRecoilValue } from 'recoil'

import { roleAtom } from '../../../state'
import { useAlertActions } from '../../../actions'
import FormInput from '../../../components/FormInput'
import BasicForm from '../../../components/Forms/BasicForm'
import LoadingPage from '../../../components/Loadings/LoadingPage'
import { history } from '../../../helpers'
import { useRoleService } from '../../../services/role.service'
import FormTextArea from '../../../components/FormTextArea'

export { RoleAddEditPage }

function RoleAddEditPage() {
  const { id } = useParams()
  const mode = { add: !id, edit: !!id }
  const roleService = useRoleService()
  const alertActions = useAlertActions()
  const role = useRecoilValue(roleAtom)

  // form validation rules
  const validationSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
  })

  const formOptions = { resolver: yupResolver(validationSchema) }

  // get functions to build form with useForm() hook
  const { register, handleSubmit, reset, formState } = useForm(formOptions)
  const { errors, isSubmitting } = formState

  useEffect(() => {
    // fetch user details into recoil state in edit mode
    if (mode.edit) {
      roleService.getById(id)
    }
    return roleService.resetRole

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // set default form values after user set in recoil state (in edit mode)
    if (mode.edit && role) {
      reset(role)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role])

  function onSubmit(data) {
    return mode.add ? createRole(data) : updateRole(role.id, data)
  }

  function createRole(data) {
    return roleService.create(data).then(() => {
      history.navigate('/settings/roles')
      alertActions.success('Role added')
    })
  }

  function updateRole(id, data) {
    return roleService.update(id, data).then(() => {
      history.navigate('/settings/roles')
      alertActions.success('Role updated')
    })
  }

  const loading = mode.edit && !role
  return (
    <>
      {!loading && (
        <div className="grid h-screen place-items-center text-center">
          <BasicForm
            onSubmit={handleSubmit(onSubmit)}
            isSubmitting={isSubmitting}
            heading={mode.add ? 'Create Role' : 'Edit Role'}
            action={mode.add ? 'Create' : 'Save'}
          >
            <FormInput
              label={'Title'}
              type={'text'}
              name={'title'}
              forId={'titleId'}
              registerHookForm={register('title')}
              errorMessage={errors.title?.message}
            />
            <FormTextArea
              label={'Description'}
              name={'description'}
              forId={'descriptionId'}
              registerHookForm={register('description')}
              errorMessage={errors.description?.message}
            />
          </BasicForm>
        </div>
      )}
      {loading && <LoadingPage />}
    </>
  )
}
