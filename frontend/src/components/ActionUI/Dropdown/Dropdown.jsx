const Dropdown = (props) => {
  return (
    <div className="dropdown dropdown-hover dropdown-bottom dropdown-end">
      {props.title && (
        <label
          tabIndex={0}
          className="btn m-1"
        >
          {props.title}
        </label>
      )}

      <ul
        tabIndex={0}
        className="dropdown-content menu p-2 shadow-xl bg-base-100 rounded-box w-52"
      >
      {props.children}
      </ul>
    </div>
  )
}

export default Dropdown