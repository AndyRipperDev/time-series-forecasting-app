import CancelIcon from '../../SVG/Path/General/CancelIcon'

const SelectableBadge= (props) => {
  return (
    <div className="badge badge-primary gap-4 rounded-xl py-6 my-2">
      {props.title}
      <button
        className="btn btn-square btn-sm"
        onClick={props.onClick}
      >
        <CancelIcon size={5}/>
      </button>
    </div>
  )
}

export default SelectableBadge