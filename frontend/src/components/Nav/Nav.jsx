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
              <svg
                className="fill-current w-6 h-6 swap-on"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <svg
                className="fill-current w-6 h-6 swap-off"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h8m-8 6h16"
                />
              </svg>
            </label>
          </span>
        </li>
        <li className="mb-2">
          <NavLink to="/">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            {/*<svg className="w-6 h-6 fill-primary" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>*/}
            {navBigView && <NavItemTitle number={1}>Home</NavItemTitle>}
          </NavLink>
        </li>
        <li className="mb-2">
          <NavLink to="/projects">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            {navBigView && <NavItemTitle number={2}>Projects</NavItemTitle>}
          </NavLink>
        </li>
        <li className="mb-2">
          <NavLink to="/dashboard">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            {navBigView && <NavItemTitle number={3}>Dashboard</NavItemTitle>}
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
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {navBigView && <NavItemTitle number={5}>Settings</NavItemTitle>}
          </NavLink>
        </li>
        <li>
          <button onClick={userService.logout}>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            {navBigView && <NavItemTitle number={6}>Log Out</NavItemTitle>}
          </button>
        </li>
      </ul>
    </nav>
  )
}

export { Nav }
