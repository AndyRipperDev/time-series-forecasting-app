import { useRecoilState } from 'recoil'

import { history } from 'helpers'
import { authAtom } from 'state'
import axios from 'axios'
import { useAlertActions } from 'actions'

export { useAxiosWrapper }

function useAxiosWrapper() {
  const [auth, setAuth] = useRecoilState(authAtom)
  const alertActions = useAlertActions()

  const forecastApi = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}`,
  })

  forecastApi.interceptors.request.use((request) => {
    const accessToken = auth?.token?.access_token
    if (accessToken) {
      request.headers.common.Authorization = `Bearer ${accessToken}`
    }

    return request
  })

  forecastApi.interceptors.response.use(null, (error) => {
    const { response } = error
    if (!response) {
      // network error
      console.error(error)
      alertActions.error('Network error')
      return
    }

    if ([401, 403].includes(response.status) && auth) {
      // auto logout if 401 or 403 response returned from api
      localStorage.removeItem('user')
      setAuth(null)
      history.navigate('/login')
    }

    const errorMessage =
      response.data?.message ||
      response.data?.detail ||
      response.statusText ||
      response.statusCode
    alertActions.error(errorMessage ? errorMessage : 'Network error')
    console.error('ERROR:', errorMessage)
    return response?.data
  })

  return {
    forecastApi,
  }
}
