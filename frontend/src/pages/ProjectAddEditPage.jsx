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
  const [project, setProject] = useRecoilState(projectAtom)

  const [file, setFile] = useState({
    file: null,
  })

  const handleFileChange = (event) => {
    setFile({ file: event.target.files[0] })
  }

  // form validation rules
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
    // if (document.getElementById('fileInput').value === '') {
    //   console.log('nope')
    //   return
    // }

    return mode.add ? createProject(data) : updateProject(project.id, data)
  }

  function handleSubmitFile(event) {
    event.preventDefault()

    return projectService.uploadFile(file.file).then(() => {
      console.log('uploaded')
      alertActions.success('File added')
    })
  }

  function createProject(data) {
    return projectService.create2(data).then((response) => {
      console.log('s' + response.data)
      //document.getElementById('fileForm').click()
      history.navigate(`/projects/add/${response.data.id}/columns-check`)
    })
  }

  function updateProject(id, data) {
    return projectService.update2(id, data).then((response) => {
      history.navigate(`/projects/add/${response.data.id}/columns-check`)
      // history.navigate('/projects')
      alertActions.success('Project updated')
    })
  }

  const loading = mode.edit && !project
  return (
    <>
      {!loading && (
        <div className="grid place-items-center text-center">
          <ul className="steps w-full md:w-2/3 lg:w-1/2 mb-20 mt-12">
            <li className="step step-primary">Fill Project Data</li>
            <li className="step">Check Columns</li>
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
            {/*<FormInput*/}
            {/*  label={'Delimiter'}*/}
            {/*  type={'text'}*/}
            {/*  name={'delimiter'}*/}
            {/*  forId={'delimiterId'}*/}
            {/*  registerHookForm={register('dataset.delimiter')}*/}
            {/*  errorMessage={errors.dataset?.delimiter?.message}*/}
            {/*/>*/}
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

          {/*<form onSubmit={handleSubmitFile} encType="multipart/form-data">*/}
          {/*  <label>*/}
          {/*    <input*/}
          {/*      id={'fileInput'}*/}
          {/*      name="file"*/}
          {/*      type="file"*/}
          {/*      className="file:btn file:btn-primary"*/}
          {/*      onChange={handleFileChange}*/}
          {/*      required*/}
          {/*    />*/}
          {/*  </label>*/}

          {/*  <button id={'fileForm'} type="submit" />*/}
          {/*</form>*/}
        </div>
      )}
      {loading && <LoadingPage />}
    </>
  )
}
