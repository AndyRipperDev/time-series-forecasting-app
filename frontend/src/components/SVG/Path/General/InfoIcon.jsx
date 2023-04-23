import Icon from '../../Base/Icon'

const InfoIcon = (props) => {
  return (
    <Icon size={props.size} className={props.className}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </Icon>
  )
}

export default InfoIcon