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
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-info flex-shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span>{props.info}</span>
        </div>
      )}
    </div>
  )
}

export default ParamSettingItem
