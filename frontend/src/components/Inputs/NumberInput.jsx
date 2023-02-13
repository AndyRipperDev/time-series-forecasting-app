const NumberInput = (props) => {
  return (
    <input
      type={'number'}
      className={'input input-bordered w-full max-w-xs'}
      min={props.min}
      max={props.max}
      step={props.step}
      value={props.value}
      onChange={props.onChange}
    />
  )
}

export default NumberInput