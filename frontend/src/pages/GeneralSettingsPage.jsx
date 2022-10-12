import CenteredList from '../components/CenteredList'
import { useUserService } from '../services'
import { useRecoilValue } from 'recoil'
import { authAtom } from '../state'

const GeneralSettingsPage = () => {
  const userService = useUserService()
  const auth = useRecoilValue(authAtom)
  return(
    <div className="my-2 md:my-4 mx-4 md:mx-10">
      <CenteredList>
      <div className="alert p-6 shadow-xl xl:w-2/5 md:w-3/5 w-4/5">
        <div>
          <span className="text-lg font-bold" >Delete your account</span>
        </div>
        <div className="flex-none">
          <button onClick={() => userService.delete(auth.user.id)} className="btn btn-sm btn-error btn-outline">
            Delete
          </button>
        </div>
      </div>
      </CenteredList>
    </div>
  )
}

export default GeneralSettingsPage
