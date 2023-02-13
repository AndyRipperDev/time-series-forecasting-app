import Icon from '../../Base/Icon'

const NavIcon = (props) => {
  return (
    <Icon size={props.size} swappable={props.swappable}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 19l-7-7m0 0l7-7m-7 7h18"
      />
    </Icon>
  )
}

export default NavIcon