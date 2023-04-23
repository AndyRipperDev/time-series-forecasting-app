const SelectInput = (props) => {
  return (
    <select
      className="select select-bordered w-full"
      value={props.value}
      onChange={props.onChange}
    >
      {props.children}
    </select>
  )
}

export default SelectInput