import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'
import { useRecoilState, useRecoilValue } from 'recoil'

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

  const validationSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
    dataset: Yup.object().shape({
      delimiter: Yup.string().required('Delimiter is required'),
    }),
    file: Yup.mixed().test('fileSize', 'Dataset file is required', (value) => {
      return mode.add ? value.length : 1
    }),
  })

  const formOptions = { resolver: yupResolver(validationSchema) }

  const { register, handleSubmit, reset, formState } = useForm(formOptions)
  const { errors, isSubmitting } = formState

  useEffect(() => {
    if (mode.edit) {
      projectService.getById(id)
    }
    return projectService.resetProject
  }, [])

  useEffect(() => {
    if (mode.edit && project) {
      reset(project)
    }
  }, [project])

  function onSubmit(data) {
    return mode.add ? createProject(data) : updateProject(project.id, data)
  }

  function createProject(data) {
    return projectService.createWithDataset(data).then((response) => {
      history.navigate(`/projects/${response.data.id}/columns-check`)
    })
  }

  function updateProject(id, data) {
    return projectService.updateWithDataset(id, data).then((response) => {
      // if(project.dataset.delimiter === response.data.dataset.delimiter) {
      //   history.navigate(`/projects/${response.data.id}`)
      // } else {
        history.navigate(`/projects/${response.data.id}/columns-check`)
      // }
    })
  }

  const loading = mode.edit && !project
  return (
    <>
      {!loading && (
        <div className="grid place-items-center text-center">
          <ul className="steps w-full md:w-2/3 lg:w-1/2 mb-20 mt-12">
            <li className="step step-primary">Fill Project Data</li>
            <li className="step">Check Dataset Columns</li>
          </ul>

          <BasicForm
            className="overflow-y-auto"
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
            {mode.add && (
              <>
                <label className="label pb-0 mt-10" htmlFor={'fileId'}>
                  <span className="label-text text-base font-semibold">
                    Dataset
                  </span>
                </label>
                <input
                  id={'fileId'}
                  name="file"
                  type="file"
                  className="file:btn file:btn-primary"
                  {...register('file')}
                />
                {errors.file?.message && (
                  <div className="text-red-500 mt-1 text-left">
                    {errors.file?.message}
                  </div>
                )}
              </>
            )}
            <label className="label pb-0" htmlFor={'delimiter'}>
              <span className="label-text text-base font-semibold">
                Delimiter
              </span>
            </label>
            <select
              name={'delimiter'}
              className="select select-bordered w-full max-w-xs"
              {...register('dataset.delimiter')}
            >
              <option value=";">;</option>
              <option value=",">,</option>
              <option value="|">|</option>
              <option value="\t">Tab</option>
              <option value=" ">Space</option>
            </select>
            {errors.dataset?.delimiter?.message && (
              <div className="text-red-500 mt-1 text-left">
                {errors.dataset?.delimiter?.message}
              </div>
            )}
          </BasicForm>
        </div>
      )}
      {loading && <LoadingPage />}
    </>
  )
}
