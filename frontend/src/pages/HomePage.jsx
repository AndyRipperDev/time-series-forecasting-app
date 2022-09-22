import { useEffect } from 'react'
import { useRecoilValue } from 'recoil'

import { authAtom, usersAtom } from 'state'
import { useUserService } from '../services'

const HomePage = () => {
  const auth = useRecoilValue(authAtom)
  const users = useRecoilValue(usersAtom)
  const userService = useUserService()

  useEffect(() => {
    userService.getAll()
  }, [])

  return (
    <div className="flex flex-col items-center mt-16">
      <h1>Hi {auth?.user?.full_name}</h1>
      <h3 className="mt-4 font-bold">Users:</h3>
      {users && (
        <ul>
          {users.map((user) => (
            <li key={user.id}>{user.full_name}</li>
          ))}
        </ul>
      )}
      {/*{!users && <div className='spinner-border spinner-border-sm'/>}*/}
    </div>
  )
}

export default HomePage
