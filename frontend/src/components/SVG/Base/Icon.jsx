import { swap } from 'plotly.js/src/plots/cartesian/axes'

const Icon = (props) => {
  const getSize = (size) => {
    if (size) {
      return "w-" + size + " h-" + size
    }
    return "w-6 h-6"
  }

  const getSwap = (swappable) => {
    if (swappable) {
      return "fill-current swap-" + swappable.toLowerCase()
    }
    return null
  }

  const getFill = (theme) => {
    return theme ? null : "none"
  }

  const getStroke = (theme) => {
    return theme ? null : "currentColor"
  }

  return (
    <svg
      className={`${getSize(props.size)} ${getSwap(props.swappable)} ${props.className}`}
      fill={getFill(props.theme)}
      stroke={getStroke(props.theme)}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      {props.children}
    </svg>
  )
}

export default Icon