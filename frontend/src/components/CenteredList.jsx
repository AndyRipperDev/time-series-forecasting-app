const CenteredList = (props) => {
  return (
    <div className="mb-6 w-full">
      {props.title && <h2 className="card-title font-bold text-2xl">{props.title}</h2>}
      {props.children}
    </div>
  )
}

export default CenteredList
