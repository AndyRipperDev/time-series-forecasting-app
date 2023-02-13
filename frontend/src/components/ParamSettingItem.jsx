import InfoIcon from './SVG/Path/General/InfoIcon'

const ParamSettingItem = (props) => {
  return (
    <div className={`flex flex-col space-y-4 justify-between w-full ${props.inGroup ? 'mb-4' : 'mb-10'}`}>
      <div className={`flex space-x-4 justify-between items-center w-full bg-base-200 p-6 rounded-2xl ${props.inGroup ? 'shadow-lg' : 'shadow-xl'}`}>
        <p className="text-lg font-semibold">{props.title}</p>
        <div>
          {props.children}
        </div>
      </div>
      {props.info && (
        <div className={'flex space-x-3 items-center'}>
          <InfoIcon size={6} className="stroke-info flex-shrink-0"/>
          <span>{props.info}</span>
        </div>
      )}
    </div>
  )
}

export default ParamSettingItem
