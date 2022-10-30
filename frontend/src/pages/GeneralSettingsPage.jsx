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
      <CenteredList>
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
  )
}

export default GeneralSettingsPage
