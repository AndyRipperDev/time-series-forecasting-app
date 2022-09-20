import { useEffect } from 'react'

const NavItemTitle = (props) => {
  useEffect(() => {
      setTimeout(() => {
        const navItem = document.getElementById('navItem-' + props.number)

        navItem.classList.remove('hidden')
      }, 200 )
    },
    [props.number]);

  return (
    <p id={`navItem-${props.number}`} className={`hidden ${props.className}`}>
      {props.children}
    </p>
  )
}

export default NavItemTitle
