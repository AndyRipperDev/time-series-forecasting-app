import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useRecoilState, useRecoilValue } from 'recoil'

import { projectAtom, projectCreateFormAtom } from '../../../state'
import FormInput from '../../FormInput'
import BasicForm from '../../Forms/BasicForm'
import { history } from '../../../helpers'
import { useProjectService } from '../../../services/project.service'

function CreateProjectUploadFile() {
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

  function updateData(data) {
    setProjectFormState((prevState) => ({ ...projectFormState, ...data }))
  }

  function onSubmit(data) {
    console.log(projectFormState)
    console.log(data)
    updateData(data)

    console.log(projectFormState)
    console.log(projectFormState)
    return projectService.create2(projectFormState).then(() => {
      history.navigate('/projects/add/columns-check')
    })
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
          heading={'Upload Dataset'}
          action={'Upload'}
        >
          <input
            id={'fileId'}
            name="file"
            type="file"
            className="file:btn file:btn-primary"
            {...register('file', {
              required: 'File is required',
            })}
          />
          <div className="text-red-500 mt-1 text-left">
            {errors.file?.message}
          </div>
          <FormInput
            label={'Delimiter'}
            type={'text'}
            name={'delimiter'}
            forId={'delimiterId'}
            registerHookForm={register('delimiter', {
              required: 'Delimiter is required',
            })}
            errorMessage={errors.delimiter?.message}
          />
        </BasicForm>
      </div>
    </>
  )
}
export default CreateProjectUploadFile
