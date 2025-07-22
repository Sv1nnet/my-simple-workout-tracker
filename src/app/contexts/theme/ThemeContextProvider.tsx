import { useAppDispatch, useAppSelector } from 'app/hooks'
import { changeTheme as changeThemeAction, selectTheme } from 'app/store/slices/config'
import { Theme } from 'app/store/slices/config/types'
import { createContext, PropsWithChildren, useCallback, useContext, useMemo } from 'react'
import { darkTheme, theme } from 'styles/vars'

export type ThemeContextType = {
  theme: Theme
  styles: typeof darkTheme | typeof theme
  changeTheme: (newTheme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  styles: theme,
  changeTheme: () => {
    console.error('changeTheme is not implemented')
  },
})

const ThemeContextProvider = ({ children }: PropsWithChildren) => {
  const themeName = useAppSelector(selectTheme)
  const dispatch = useAppDispatch()

  const changeTheme = useCallback((newTheme: Theme) => {
    dispatch(changeThemeAction(newTheme))
  }, [ dispatch ])
  
  const currentTheme = useMemo(() => ({
    theme: themeName,
    styles: themeName === 'dark' ? darkTheme : theme,
    changeTheme,
  }), [ themeName, changeTheme ])

  return <ThemeContext.Provider value={currentTheme}>{children}</ThemeContext.Provider>
}

export const useThemeContext = (): ThemeContextType => useContext(ThemeContext)

export default ThemeContextProvider