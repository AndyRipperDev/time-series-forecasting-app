const TextHeading = (props) => {
  return (
    <h2 className="mb-4 md:mb-6 text-3xl font-bold card-title">
      {props.children}
    </h2>
  )
}

export default TextHeading
