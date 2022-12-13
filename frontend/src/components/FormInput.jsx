const FormInput = (props) => {
  return (
    <div className="form-control w-full max-w-xs">
      {!props.hideLabel && (
        <label className="label" htmlFor={props.forId}>
          <span className="label-text text-base font-semibold">
            {props.label}
          </span>
        </label>
      )}
      <input
        name={props.name}
        type={props.type}
        id={props.forId}
        placeholder={'Type your ' + props.label.toLowerCase() + ' here...'}
        className={`${
          props.type === 'checkbox'
            ? 'checkbox checkbox-primary'
            : 'input input-bordered w-full max-w-xs'
        }`}
        value={props.value}
        onChange={props.onChange}
        {...props.registerHookForm}
      />
      {props.errorMessage && (
        <div className="text-red-500 mt-1 text-left">{props.errorMessage}</div>
      )}
    </div>
  )
}

export default FormInput
