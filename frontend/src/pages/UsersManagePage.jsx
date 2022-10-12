import { useUserService } from '../services'
import { useEffect, useState } from 'react'
import { useRecoilValue } from 'recoil'
import { usersAtom } from '../state'
import { Link } from 'react-router-dom'
import LoadingPage from '../components/Loadings/LoadingPage'

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
          <h3 className="mb-4 md:mb-6 text-3xl font-bold card-title">Users</h3>
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
                      <td className="flex items-center py-5 px-6 md:px-8 md:space-x-6 space-x-3">
                        <Link
                          to={`/settings/user/${user.id}/edit`}
                          className="font-medium text-blue-500 hover:underline"
                        >
                          Edit
                        </Link>

                        <Link
                          to={`/settings/user/${user.id}/delete`}
                          className="font-medium text-red-600 dark:text-red-500 hover:underline"
                        >
                          Remove
                        </Link>
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
