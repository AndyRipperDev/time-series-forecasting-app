import Icon from '../../Base/Icon'

const CancelIcon = (props) => {
  return (
    <Icon size={props.size}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M6 18L18 6M6 6l12 12"
      />
    </Icon>
  )
}

export default CancelIcon