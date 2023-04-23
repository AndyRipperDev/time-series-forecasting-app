import SettingsItem from '../../components/SettingsItem'
import CenteredList from '../../components/CenteredList'
import { useUserService } from '../../services'

const SettingsPage = () => {
  const userService = useUserService()
  return (
    <div className="my-2 md:my-4 mx-4 md:mx-10">
      <h1 className="text-2xl font-bold md:text-3xl mt-10 mb-10">Settings</h1>
      <div className={'flex flex-col items-center mx-auto w-5/6 md:w-2/3 max-w-xl space-y-4 mb-6'}>
        <CenteredList title={'User Settings'}>
          <SettingsItem
            title="General"
            description="General Settings"
            action="Manage"
            redirect="settings/general"
          />
        </CenteredList>

        {userService.isLoggedInUserAdmin() && (
          <CenteredList title={'Admin Settings'}>
            <SettingsItem
              title="Users"
              description="Administration of All Users"
              action="Manage"
              redirect="settings/users"
            />
            <SettingsItem
              title="Roles"
              description="Administration of All Roles"
              action="Manage"
              redirect="settings/roles"
            />
          </CenteredList>
        )}
      </div>
    </div>
  )
}

export default SettingsPage
