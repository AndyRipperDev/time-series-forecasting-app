import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'
import { useRecoilValue } from 'recoil'

import { rolesAtom, userAtom } from '../../../state'
import { useAlertActions } from '../../../actions'
import { useUserService } from '../../../services'
import FormInput from '../../../components/FormInput'
import BasicForm from '../../../components/Forms/BasicForm'
import LoadingPage from '../../../components/Loadings/LoadingPage'
import { history } from '../../../helpers'
import Loading from '../../../components/Loadings/Loading'
import { useRoleService } from '../../../services/role.service'
import ParamSettingItem from '../../../components/ParamSettingItem'
import Dropdown from '../../../components/ActionUI/Dropdown/Dropdown'
import DropdownItem from '../../../components/ActionUI/Dropdown/DropdownItem'
import SelectableBadgeArea from '../../../components/ActionUI/SelectableBadge/SelectableBadgeArea'
import SelectableBadge from '../../../components/ActionUI/SelectableBadge/SelectableBadge'
import ForecastIcon from '../../../components/SVG/Path/General/ForecastIcon'
import RolesIcon from '../../../components/SVG/Path/General/RolesIcon'

export { UserRolesEditPage }

function UserRolesEditPage() {
  const { id } = useParams()
  const userService = useUserService()
  const roleService = useRoleService()
  const user = useRecoilValue(userAtom)
  const roles = useRecoilValue(rolesAtom)
  const [rolesToChoose, setRolesToChoose] = useState([])

  useEffect(() => {
    userService.getById(id)
    roleService.getAll()

    return () => {
      userService.resetUser()
      roleService.resetRoles()
    }
  }, [])

  if (user && roles && rolesToChoose.length === 0) {
    let newRolesToChoose = []

    roles.map((role) => {
        let roleToChoose = {
          id: role.id,
          title: role.title,
          description: role.description,
          chosen: user?.roles?.some(userRole => userRole.id === role.id),
        }
        newRolesToChoose.push(roleToChoose)
      })

      setRolesToChoose(newRolesToChoose)
    }

  const handleRolesChange = (event, roleId) => {
    let newRolesToChoose = [...rolesToChoose].map((role) => {
      if (role.id === roleId)
        return { ...role, chosen: !role.chosen }
      else return role
    })

    setRolesToChoose(newRolesToChoose)
  }

  function handleSubmit(e) {
    let userRoles = [...rolesToChoose].filter((role) => {
      return role.chosen
    }).map((role) =>  {
      return {
        id: role.id,
        title: role.title,
        description: role.description,
      }
    })

    userService.updateUserRoles(user.id, userRoles).then(() => {
      history.navigate('/settings/users')
    })
  }

  const loading = !user || !roles
  return (
    <div className={'my-12'}>
      {loading ? (
        <LoadingPage />
      ) : (
        <div className={'w-full'}>
          <div className={'flex flex-col items-center mx-auto w-5/6 md:w-2/3 max-w-6xl space-y-4 mb-6'}>
            <h1 className={'text-3xl font-bold text-center mb-20'}>
              {user.full_name}'s User Roles
            </h1>
            <ParamSettingItem title="User Roles">
              <Dropdown title={'Choose'}>
                {rolesToChoose?.map(
                  (role) =>
                    !role.chosen && (
                      <DropdownItem key={role.id} onClick={(e) => handleRolesChange(e, role.id)}>
                        {role.title}
                      </DropdownItem>
                    )
                )}
              </Dropdown>
            </ParamSettingItem>
            <SelectableBadgeArea>
              {rolesToChoose?.map(
                (role) =>
                  role.chosen && (
                    <SelectableBadge
                      key={role.id}
                      title={role.title}
                      onClick={(e) => handleRolesChange(e, role.id)}
                    />
                  )
              )}
            </SelectableBadgeArea>
            <div className={'w-full flex justify-center pt-24'}>
              <button
                className="btn btn-primary btn-wide gap-3"
                onClick={(e) => handleSubmit(e)}
              >
                Save
              </button>
            </div>
          </div>
        </div>
        )}
    </div>
  )
}
