const FormInput = (props) => {
  return (
    <div className="form-control w-full max-w-xs">
      <label className="label" htmlFor={props.forId}>
        <span className="label-text text-base font-semibold ">
          {props.label}
        </span>
      </label>
      <input
        name = {props.name}
        type={props.type}
        id={props.forId}
        placeholder={'Type your ' + props.label.toLowerCase() + ' here...'}
        className="input input-bordered w-full max-w-xs"
        value={props.value}
        onChange={props.onChange}
      />
    </div>
  )
}

export default FormInput
