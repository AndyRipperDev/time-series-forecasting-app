const CheckBoxInput = (props) => {
  return (
    <input
      type={'checkbox'}
      className={'checkbox checkbox-primary'}
      checked={props.checked}
      onChange={props.onChange}
    />
  )
}

export default CheckBoxInput