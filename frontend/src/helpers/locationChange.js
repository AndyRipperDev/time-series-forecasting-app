import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const useOnLocationChange = (handleLocationChange) => {
  const location = useLocation()

  useEffect(
    () => handleLocationChange(location),
    [location, handleLocationChange]
  )
}

export default useOnLocationChange
