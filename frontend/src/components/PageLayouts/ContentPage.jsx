import { authAtom } from '../../state'
import { useRecoilValue } from 'recoil'

const ContentPage = (props) => {
  const auth = useRecoilValue(authAtom)

  return (
    <div
      className={`flex-auto bg-base-100 overflow-auto shadow-2xl shadow-base-100 ${
        auth ? 'rounded-l-2xl' : ''
      }`}
    >
      {props.children}
    </div>
  )
}

export default ContentPage
