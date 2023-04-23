import { Link } from 'react-router-dom'

const GeneralSettingsItem = (props) => {
  return (
    <div className="alert p-6 mt-4 mb-8 shadow-xl">
      <div>
        <span className="text-lg font-bold">{props.title}</span>
      </div>
      <div className="flex-none">
        {props.redirect ? (
          <Link
            to={`/${props.redirect}`}
            className={`btn btn-sm btn-outline w-20 ${
              props.isPrimary ? 'btn-info' : 'btn-error'
            } `}
          >
            {props.action}
          </Link>
        ) : (
          <button
            onClick={props.onClick}
            className={`btn btn-sm btn-outline w-20 ${
              props.isPrimary ? 'btn-info' : 'btn-error'
            }`}
          >
            {props.action}
          </button>
        )}
      </div>
    </div>
  )
}

export default GeneralSettingsItem
