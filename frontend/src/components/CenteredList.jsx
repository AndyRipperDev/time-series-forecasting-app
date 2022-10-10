const CenteredList = (props) => {
  return (
    <div className="flex justify-center items-center flex-col mb-6">
      {props.title && <h2 className="card-title">{props.title}</h2>}
      {props.children}
    </div>
  )
}

export default CenteredList
