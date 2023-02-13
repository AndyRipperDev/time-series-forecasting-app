import Icon from '../../Base/Icon'

const ForecastIcon = (props) => {
  return (
    <Icon size={props.size}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
      />
    </Icon>
  )
}

export default ForecastIcon