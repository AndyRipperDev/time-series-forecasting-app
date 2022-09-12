const BasicForm = (props) => {
  return (
    <form className="w-96" onSubmit={props.onSubmit}>
      <div className="card w-96 bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="text-center text-2xl font-bold mb-6">{props.heading}</h2>
          {props.children}
          <div className="card-actions mt-14">
            <button className="btn btn-primary btn-block">{props.action}</button>
            {props.details && <div className="m-auto text-center mt-14"> {props.details}</div>}
          </div>
        </div>
      </div>
    </form>
  )
}

export default BasicForm
