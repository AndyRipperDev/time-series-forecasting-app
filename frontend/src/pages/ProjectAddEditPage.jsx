import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'
import { useRecoilValue } from 'recoil'

import { projectAtom } from '../state'
import { useAlertActions } from '../actions'
import FormInput from '../components/FormInput'
import BasicForm from '../components/Forms/BasicForm'
import LoadingPage from '../components/Loadings/LoadingPage'
import { history } from '../helpers'
import FormTextArea from '../components/FormTextArea'
import { useProjectService } from '../services/project.service'

export { ProjectAddEditPage }

function ProjectAddEditPage() {
  const { id } = useParams()
  const mode = { add: !id, edit: !!id }
  const projectService = useProjectService()
  const alertActions = useAlertActions()
  const project = useRecoilValue(projectAtom)

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
      projectService.getById(id)
    }
    return projectService.resetProject

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // set default form values after user set in recoil state (in edit mode)
    if (mode.edit && project) {
      reset(project)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project])

  function onSubmit(data) {
    return mode.add ? createProject(data) : updateProject(project.id, data)
  }

  function createProject(data) {
    return projectService.create(data).then(() => {
      history.navigate('/projects')
      alertActions.success('Project added')
    })
  }

  function updateProject(id, data) {
    return projectService.update(id, data).then(() => {
      history.navigate('/projects')
      alertActions.success('Project updated')
    })
  }

  const loading = mode.edit && !project
  return (
    <>
      {!loading && (
        <div className="grid h-screen place-items-center text-center">
          <BasicForm
            onSubmit={handleSubmit(onSubmit)}
            isSubmitting={isSubmitting}
            heading={mode.add ? 'Add Project' : 'Edit Project'}
            action={mode.add ? 'Add' : 'Save'}
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
