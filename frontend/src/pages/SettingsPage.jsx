import SettingsItem from '../components/SettingsItem'
import CenteredList from '../components/CenteredList'
import { useUserService } from '../services'

const SettingsPage = () => {
  const userService = useUserService()
  return (
    <div>
      <CenteredList title={'Settings'}>
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
  )
}

export default SettingsPage
