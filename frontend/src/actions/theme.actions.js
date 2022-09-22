import { useRecoilState  } from 'recoil';

import { themeAtom } from '../state';

export { useThemeActions };

function useThemeActions () {
  const [theme, setTheme] = useRecoilState(themeAtom);

  const Themes = {
    Dark: 'dark',
    Night: 'night',
    Dracula: 'dracula',
    Light: 'light',
    Winter: 'winter',
    Emerald: 'emerald',
  }

  return {
    initTheme,
    changeTheme,
    Themes
  }

  function initTheme() {
    if (!('theme' in localStorage)) {
      localStorage.theme = theme
    }
    document.documentElement.setAttribute('data-theme', theme)
  }

  function changeTheme(newTheme) {
    localStorage.theme = newTheme
    setTheme(newTheme);
  }
}
