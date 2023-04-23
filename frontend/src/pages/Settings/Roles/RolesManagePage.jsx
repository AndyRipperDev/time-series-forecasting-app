import { useEffect, useState } from 'react'
import { useRecoilValue } from 'recoil'
import { rolesAtom } from '../../../state'
import { Link } from 'react-router-dom'
import LoadingPage from '../../../components/Loadings/LoadingPage'
import { useRoleService } from '../../../services/role.service'
import DeleteIcon from '../../../components/SVG/Path/CRUD/DeleteIcon'
import EditIcon from '../../../components/SVG/Path/CRUD/EditIcon'
import CreateIcon from '../../../components/SVG/Path/CRUD/CreateIcon'

const RolesManagePage = () => {
  const roleService = useRoleService()
  const roles = useRecoilValue(rolesAtom)
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    roleService.getAll().then((response) => setLoading(false))
  }, [])

  return (
    <div>
      {isLoading ? (
        <LoadingPage />
      ) : (
        <div className="my-2 md:my-4 mx-4 md:mx-10">
          <div className={'flex justify-between'}>
            <h1 className="text-2xl font-bold md:text-3xl mt-6">Roles</h1>
            <Link
              to="/settings/roles/add"
              className="btn hover:text-info gap-3 my-4"
            >
              <CreateIcon size={5}/>
              Create New Role
            </Link>
          </div>
          {roles && (
            <div className="overflow-x-auto relative shadow-xl rounded-xl">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-base-300">
                  <tr>
                    <th scope="col" className="py-5 px-6 md:px-8">
                      Title
                    </th>
                    <th scope="col" className="py-5 px-6 md:px-8">
                      Description
                    </th>
                    <th scope="col" className="py-5 px-6 md:px-8">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role) => (
                    <tr className="bg-base-200 hover:bg-base-100" key={role.id}>
                      <th
                        scope="row"
                        className="py-5 px-6 md:px-8 font-medium whitespace-nowrap"
                      >
                        {role.title}
                      </th>
                      <td className="py-5 px-6 md:px-8">{role.description}</td>
                      <td className="py-2 px-6 md:px-8">
                        <div className="btn-group mx-2 lg:mx-4">
                          <Link
                            to={`/settings/roles/edit/${role.id}`}
                            className="btn gap-2 hover:text-info"
                          >
                            <EditIcon size={5}/>
                          </Link>

                          <button
                            onClick={() => roleService.delete(role.id)}
                            className={`btn ${
                              role.isDeleting ? 'loading' : ''
                            } gap-2 hover:text-error`}
                          >
                            {!role.isDeleting && (
                              <DeleteIcon size={5}/>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default RolesManagePage
