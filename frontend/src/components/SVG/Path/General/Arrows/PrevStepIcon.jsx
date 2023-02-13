import Icon from '../../../Base/Icon'

const PrevStepIcon = (props) => {
  return (
    <Icon size={props.size}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 19l-7-7 7-7"
      />
    </Icon>
  )
}

export default PrevStepIcon