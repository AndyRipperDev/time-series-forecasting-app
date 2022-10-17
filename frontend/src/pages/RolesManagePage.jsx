import { useEffect, useState } from 'react'
import { useRecoilValue } from 'recoil'
import { rolesAtom } from '../state'
import { Link } from 'react-router-dom'
import LoadingPage from '../components/Loadings/LoadingPage'
import TextHeading from '../components/TextHeading'
import { useRoleService } from '../services/role.service'

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
          <TextHeading>Roles</TextHeading>
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
                      <td className="flex items-center py-5 px-6 md:px-8 md:space-x-6 space-x-3">
                        <Link
                          to={`/settings/role/${role.id}/edit`}
                          className="btn btn-square btn-sm btn-outline text-blue-500 hover:bg-blue-500 hover:text-primary-content hover:border-blue-500"
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
                          } btn-square btn-sm btn-outline btn-error`}
                        >
                          {!role.isDeleting && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          )}
                        </button>
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
