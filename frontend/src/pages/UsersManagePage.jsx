import { useUserService } from '../services'
import { useEffect, useState } from 'react'
import { useRecoilValue } from 'recoil'
import { usersAtom } from '../state'
import { Link } from 'react-router-dom'
import LoadingPage from '../components/Loadings/LoadingPage'
import TextHeading from '../components/TextHeading'
import Modal from '../components/Modal'

const UsersManagePage = () => {
  const userService = useUserService()
  const users = useRecoilValue(usersAtom)
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    userService.getAll().then((response) => setLoading(false))
  }, [])

  return (
    <div>
      {isLoading ? (
        <LoadingPage />
      ) : (
        <div className="my-2 md:my-4 mx-4 md:mx-10">
          <div className={'flex justify-between'}>
            <h1 className="text-2xl font-bold md:text-3xl mt-6">Users</h1>
            <Link
              to="/settings/users/add"
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
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              Create New User
            </Link>
          </div>
          {users && (
            <div className="overflow-x-auto relative shadow-xl rounded-xl">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-base-300">
                  <tr>
                    <th scope="col" className="py-5 px-6 md:px-8">
                      User Name
                    </th>
                    <th scope="col" className="py-5 px-6 md:px-8">
                      E-Mail
                    </th>
                    <th scope="col" className="py-5 px-6 md:px-8">
                      Is Active
                    </th>
                    <th scope="col" className="py-5 px-6 md:px-8">
                      Roles
                    </th>
                    <th scope="col" className="py-5 px-6 md:px-8">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr className="bg-base-200 hover:bg-base-100" key={user.id}>
                      <th
                        scope="row"
                        className="py-5 px-6 md:px-8 font-medium whitespace-nowrap"
                      >
                        {user.full_name}
                      </th>
                      <td className="py-5 px-6 md:px-8">{user.email}</td>
                      <td className="py-5 px-6 md:px-8">
                        {user.is_active ? 'Yes' : 'No'}
                      </td>
                      <td className="py-5 px-6 md:px-8">
                        {user.roles.length !== 0 ? (
                          user.roles.map((role) => {
                            return (
                              <div key={role.id}>
                                <p>{role.title}</p>
                              </div>
                            )
                          })
                        ) : (
                          <p>None</p>
                        )}
                      </td>
                      <td className="py-2 px-6 md:px-8">
                        <div className="btn-group mx-2 lg:mx-4">
                          <Link
                            to={`/settings/users/edit/${user.id}`}
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
                          <Link
                            to={`/settings/users/${user.id}/roles`}
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
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                              />
                            </svg>
                          </Link>

                          <button
                            onClick={() => userService.delete(user.id)}
                            className={`btn ${
                              user.isDeleting ? 'loading' : ''
                            } gap-2 hover:text-error`}
                          >
                            {!user.isDeleting && (
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

export default UsersManagePage
