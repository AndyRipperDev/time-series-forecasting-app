import { useEffect, useState } from 'react'
import { useRecoilValue } from 'recoil'
import { rolesAtom } from '../../../state'
import { Link } from 'react-router-dom'
import LoadingPage from '../../../components/Loadings/LoadingPage'
import TextHeading from '../../../components/TextHeading'
import { useRoleService } from '../../../services/role.service'

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
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
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
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                          </Link>

                          <button
                            onClick={() => roleService.delete(role.id)}
                            className={`btn ${
                              role.isDeleting ? 'loading' : ''
                            } gap-2 hover:text-error`}
                          >
                            {!role.isDeleting && (
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
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
