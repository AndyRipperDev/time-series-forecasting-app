import { NavLink } from 'react-router-dom'
import { useRecoilValue, useSetRecoilState } from 'recoil'

import {
  authAtom,
  navBigViewAtom,
  toggleNavBigViewAtom,
  themeAtom,
} from 'state'
import { useUserService } from 'services'
import ThemeToggle from '../ThemeToggle'
import NavItemTitle from './NavItemTitle'
import BackIcon from '../SVG/Path/General/BackIcon'
import NavIcon from '../SVG/Path/General/NavIcon'
import LogOutIcon from '../SVG/Path/General/LogOutIcon'
import SettingsIcon from '../SVG/Path/General/SettingsIcon'
import ForecastsIcon from '../SVG/Path/General/ForecastsIcon'
import ProjectsIcon from '../SVG/Path/General/ProjectsIcon'
import HomeIcon from '../SVG/Path/General/HomeIcon'

const Nav = () => {
  const auth = useRecoilValue(authAtom)
  const theme = useRecoilValue(themeAtom)
  const userService = useUserService()
  const navBigView = useRecoilValue(navBigViewAtom)
  const toggleNavBigView = useSetRecoilState(toggleNavBigViewAtom)

  // only show nav when logged in
  if (!auth) return null

  function handleNavChange() {
    toggleNavBigView()
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'))
    }, 400)
  }

  return (
    <nav
      className={`menu p-3 rounded-r-2xl h-screen flex flex-col justify-between transition-width transition-slowest duration-500 ease-in-out ${
        navBigView ? 'w-72' : 'w-20'
      }`}
    >
      <ul>
        <li className="mb-16 place-content-end">
          <span onClick={handleNavChange}>
            <label
              id="navToggle"
              className={`swap ${navBigView ? 'swap-active' : ''}`}
            >
              <NavIcon size={6} swappable={'on'}/>
              <BackIcon size={6} swappable={'off'}/>
            </label>
          </span>
        </li>
        <li className="mb-2">
          <NavLink to="/">
            <HomeIcon size={6}/>
            {navBigView && <NavItemTitle number={1}>Home</NavItemTitle>}
          </NavLink>
        </li>
        <li className="mb-2">
          <NavLink to="/projects">
            <ProjectsIcon size={6}/>
            {navBigView && <NavItemTitle number={2}>Projects</NavItemTitle>}
          </NavLink>
        </li>
        <li className="mb-2">
          <NavLink to="/forecasting">
            <ForecastsIcon size={6}/>
            {navBigView && <NavItemTitle number={3}>Forecasting</NavItemTitle>}
          </NavLink>
        </li>
      </ul>
      <ul>
        <li className="mb-2">
          <ThemeToggle className="place-content-start">
            {navBigView && (
              <NavItemTitle className="capitalize" number={4}>
                {theme} Theme
              </NavItemTitle>
            )}
          </ThemeToggle>
        </li>
        <li className="mb-2">
          <NavLink to="/settings">
            <SettingsIcon size={6}/>
            {navBigView && <NavItemTitle number={5}>Settings</NavItemTitle>}
          </NavLink>
        </li>
        <li>
          <button onClick={userService.logout}>
            <LogOutIcon size={6}/>
            {navBigView && <NavItemTitle number={6}>Log Out</NavItemTitle>}
          </button>
        </li>
      </ul>
    </nav>
  )
}

export { Nav }
