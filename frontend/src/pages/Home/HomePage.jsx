import { useEffect } from 'react'
import { useRecoilValue } from 'recoil'

import { authAtom } from 'state'
import { useUserService } from '../../services'
import { Link } from 'react-router-dom'
import CreateProjectIcon from '../../components/SVG/Path/CRUD/CreateProjectIcon'

const HomePage = () => {
  const auth = useRecoilValue(authAtom)

  return (
    <div className="flex flex-col items-center mt-12">
      <h1 className="font-bold text-2xl mb-12">
        Welcome back {auth?.user?.full_name}
      </h1>
      <Link to="/projects/add" className="btn btn-active btn-primary gap-4">
        <CreateProjectIcon size={6}/>
        Create New Project
      </Link>
    </div>
  )
}

export default HomePage
