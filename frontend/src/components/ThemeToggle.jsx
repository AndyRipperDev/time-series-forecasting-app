import { useRecoilValue } from 'recoil'
import { themeAtom } from '../state'
import { useThemeActions } from '../actions'
import { useEffect } from 'react'
import ThemeDarkIcon from './SVG/Path/General/ThemeDarkIcon'
import ThemeLightIcon from './SVG/Path/General/ThemeLightIcon'

const ThemeToggle = (props) => {
  const theme = useRecoilValue(themeAtom);
  const themeActions = useThemeActions();
  const themeDark = themeActions.Themes.Dark
  const themeLight = themeActions.Themes.Light

  useEffect(() => {
    setTimeout(() => {
      const themeToggle = document.getElementById('themeToggle');
      if(theme === themeDark) {
        themeToggle.classList.remove('swap-active');
      } else {
        themeToggle.classList.add('swap-active');
      }
    }, 200)
  }, [theme, themeDark]);

  const handleClick = () => {
    themeActions.changeTheme(theme === themeDark ? themeLight : themeDark)
  }

  return (
    <>
    <label id="themeToggle" className="swap swap-rotate place-content-start" onClick={handleClick}>
      <ThemeDarkIcon size={6} swappable={'off'}/>
      <ThemeLightIcon size={6} swappable={'on'}/>
      {props.children && <div className="ml-9"> {props.children}</div>}
    </label>
  </>
  )
}

export default ThemeToggle
