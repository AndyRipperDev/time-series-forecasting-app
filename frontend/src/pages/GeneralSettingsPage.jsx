import CenteredList from '../components/CenteredList'
import { useUserService } from '../services'
import { useRecoilValue } from 'recoil'
import { authAtom } from '../state'
import GeneralSettingsItem from '../components/GeneralSettingsItem'

const GeneralSettingsPage = () => {
  const userService = useUserService()
  const auth = useRecoilValue(authAtom)
  return (
    <div className="my-2 md:my-4 mx-4 md:mx-10">
      <h1 className="text-2xl font-bold md:text-3xl mt-10 mb-10">General Settings</h1>
      <div className={'flex flex-col items-center mx-auto w-5/6 md:w-2/3 max-w-xl space-y-4 mb-6'}>
        <CenteredList title={'Account'}>
          <GeneralSettingsItem
            title={'Edit your account'}
            action={'Edit'}
            isPrimary={true}
            redirect={'settings/account/edit'}
          />
          <GeneralSettingsItem
            title={'Change your password'}
            action={'Change'}
            isPrimary={true}
            redirect={'settings/account/change-password'}
          />
          <GeneralSettingsItem
            title={'Delete your account'}
            action={'Delete'}
            isPrimary={false}
            onClick={() => userService.delete(auth.user.id)}
          />
        </CenteredList>
      </div>
    </div>
  )
}

export default GeneralSettingsPage
