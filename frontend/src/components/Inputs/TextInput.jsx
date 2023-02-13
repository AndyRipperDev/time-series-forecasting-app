const TextInput = (props) => {
  return (
    <input
      type={'text'}
      className={'input input-bordered w-full max-w-xs'}
      value={props.value}
      onChange={props.onChange}
    />
  )
}

export default TextInput