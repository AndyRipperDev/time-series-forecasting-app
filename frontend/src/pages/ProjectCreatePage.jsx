import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'
import { useRecoilState, useRecoilValue } from 'recoil'

import { projectAtom, projectCreateFormAtom } from '../state'
import { useAlertActions } from '../actions'
import FormInput from '../components/FormInput'
import BasicForm from '../components/Forms/BasicForm'
import LoadingPage from '../components/Loadings/LoadingPage'
import { history } from '../helpers'
import FormTextArea from '../components/FormTextArea'
import { useProjectService } from '../services/project.service'

export { ProjectCreatePage }

function ProjectCreatePage() {
  const projectService = useProjectService()
  const project = useRecoilValue(projectAtom)
  const [projectFormState, setProjectFormState] = useRecoilState(
    projectCreateFormAtom
  )

  // get functions to build form with useForm() hook
  const { register, handleSubmit, formState } = useForm()
  const { errors, isSubmitting } = formState

  useEffect(() => {
    return projectService.resetProject
  }, [])

  function onSubmit(data) {
    setProjectFormState({ ...projectFormState, ...data })

    history.navigate('/projects/add/file-upload')
  }

  return (
    <>
      <div className="grid h-screen place-items-center text-center">
        <ul className="steps w-full md:w-2/3 lg:w-1/2">
          <li className="step step-primary">Fill Info</li>
          <li className="step step-primary">Upload Dataset</li>
          <li className="step">Check Columns</li>
        </ul>

        <BasicForm
          onSubmit={handleSubmit(onSubmit)}
          isSubmitting={isSubmitting}
          heading={'Add Project Details'}
          action={'Next'}
        >
          <FormInput
            label={'Title'}
            type={'text'}
            name={'title'}
            forId={'titleId'}
            registerHookForm={register('title', {
              required: 'Title is required',
            })}
            errorMessage={errors.title?.message}
          />
          <FormTextArea
            label={'Description'}
            name={'description'}
            forId={'descriptionId'}
            registerHookForm={register('description', {
              required: 'Description is required',
            })}
            errorMessage={errors.description?.message}
          />
        </BasicForm>
      </div>
    </>
  )
}
