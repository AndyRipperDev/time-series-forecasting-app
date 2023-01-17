const GeneralParamSettingItem = (props) => {
  return (
    <div className="flex space-x-4 justify-between items-center w-full bg-base-200 p-6 rounded-2xl shadow-xl mb-10">
      {props.leftSide}
      <div>
        {props.children}
      </div>
    </div>
  )
}

export default GeneralParamSettingItem
