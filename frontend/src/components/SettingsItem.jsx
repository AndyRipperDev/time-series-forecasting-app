import { Link } from 'react-router-dom'

const SettingsItem = (props) => {
  return (
    <div className="card xl:w-2/5 md:w-3/5 w-4/5 bg-base-200 shadow-xl m-5">
      <div className="card-body">
        <h2 className="card-title">{props.title}</h2>
        <p>{props.description}</p>
        <div className="card-actions justify-end">
          {props.redirect && (
            <Link to={`/${props.redirect}`} className="btn btn-primary">
              {props.action}
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default SettingsItem
