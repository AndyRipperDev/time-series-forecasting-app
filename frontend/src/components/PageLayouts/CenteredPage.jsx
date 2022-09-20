const CenteredPage = (props) => {
  return (
    <div className="flex justify-center items-center h-screen">
      {props.children}
    </div>
  )
}

export default CenteredPage
