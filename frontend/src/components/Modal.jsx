const Modal = (props) => {
  return (
    <div>
      <input type="checkbox" id={props.forId} className="modal-toggle" />
      <label
        htmlFor={props.forId}
        className="modal modal-bottom sm:modal-middle"
      >
        <label className="modal-box relative" htmlFor="">
          {props.children}
          <div className="modal-action">
            <label htmlFor={props.forId} className="btn">
              {props.action}
            </label>
          </div>
        </label>
      </label>
    </div>
  )
}

export default Modal
