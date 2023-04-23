import Icon from '../../Base/Icon'

const BackIcon = (props) => {
  return (
    <Icon size={props.size} swappable={props.swappable}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h8m-8 6h16"
      />
    </Icon>
  )
}

export default BackIcon