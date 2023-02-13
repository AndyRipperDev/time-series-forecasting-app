const SelectableBadgeArea = (props) => {
  return (
    <div className={'flex space-x-6 flex-wrap'}>
      {props.children}
    </div>
  )
}

export default SelectableBadgeArea