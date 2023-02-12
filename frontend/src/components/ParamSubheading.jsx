const ParamSubheading = (props) => {
  return (
    <h3 className={`text-xl font-bold self-start mb-4 ${props.firstParam ? 'mt-4' : 'mt-10'}`}>
      {props.children}
    </h3>
  )
}

export default ParamSubheading
