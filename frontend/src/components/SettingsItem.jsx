import { Link } from 'react-router-dom'

const SettingsItem = (props) => {
  return (
    <div className="card bg-base-200 shadow-xl mt-4 mb-6">
      <div className="card-body ">
        <h2 className="card-title font-bold">{props.title}</h2>
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
