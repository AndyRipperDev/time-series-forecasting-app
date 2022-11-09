import { useEffect } from 'react'
import { useRecoilValue } from 'recoil'

import { authAtom } from 'state'
import { Link } from 'react-router-dom'

const CreateProjectDetails = () => {
  const auth = useRecoilValue(authAtom)

  return <div></div>
}

export default CreateProjectDetails
