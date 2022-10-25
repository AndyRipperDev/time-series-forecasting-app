import { useEffect } from 'react'
import { useRecoilValue } from 'recoil'

import { authAtom } from 'state'
import { useUserService } from '../services'

const HomePage = () => {
  const auth = useRecoilValue(authAtom)

  return (
    <div className="flex flex-col items-center mt-12">
      <h1 className="font-bold text-2xl mb-12">
        Welcome back {auth?.user?.full_name}
      </h1>
      <button className="btn btn-active btn-primary gap-4">
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z"
          />
        </svg>
        Create New Project
      </button>
    </div>
  )
}

export default HomePage
