import Icon from '../../Base/Icon'

const DownloadIcon = (props) => {
  return (
    <Icon size={props.size}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </Icon>
  )
}

export default DownloadIcon