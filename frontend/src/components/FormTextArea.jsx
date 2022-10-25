const FormTextArea = (props) => {
  return (
    <div className="form-control w-full max-w-xs">
      <label className="label" htmlFor={props.forId}>
        <span className="label-text text-base font-semibold">
          {props.label}
        </span>
      </label>
      <textarea
        name={props.name}
        id={props.forId}
        placeholder={'Type your ' + props.label.toLowerCase() + ' here...'}
        value={props.value}
        onChange={props.onChange}
        {...props.registerHookForm}
        className="textarea textarea-bordered h-24"
      ></textarea>
      {props.errorMessage && (
        <div className="text-red-500 mt-1 text-left">{props.errorMessage}</div>
      )}
    </div>
  )
}

export default FormTextArea
