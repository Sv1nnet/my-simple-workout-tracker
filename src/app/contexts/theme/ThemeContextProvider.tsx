import { useAppDispatch, useAppSelector, useMounted } from 'app/hooks'
import { changeTheme as changeThemeAction, selectTheme } from 'app/store/slices/settings'
import { Theme } from 'app/store/slices/settings/types'
import handleSafeArea from 'app/utils/handleSafeArea'
import { SafeAreaInsets } from 'capacitor-plugin-safe-area'
import { createContext, PropsWithChildren, useCallback, useContext, useLayoutEffect, useMemo, useState } from 'react'
import { darkTheme, theme } from 'styles/vars'
import { applyTheme } from 'utils/theme'

export type ThemeContextType = {
  insets: SafeAreaInsets['insets']
  theme: Theme
  styles: typeof darkTheme | typeof theme
  changeTheme: (newTheme: Theme) => void
}

const defaultInsets = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
}

const ThemeContext = createContext<ThemeContextType>({
  insets: defaultInsets,
  theme: 'light',
  styles: theme,
  changeTheme: () => {
    console.error('changeTheme is not implemented')
  },
})

const ThemeContextProvider = ({ children }: PropsWithChildren) => {
  const [ insets, setInsets ] = useState<SafeAreaInsets['insets']>(defaultInsets)

  const themeName = useAppSelector(selectTheme)
  const dispatch = useAppDispatch()
  const { isMounted, useHandleMounted } = useMounted()

  const changeTheme = useCallback((newTheme: Theme) => {
    applyTheme(newTheme)
    dispatch(changeThemeAction(newTheme))
  }, [ dispatch ])
  
  const value = useMemo<ThemeContextType>(() => ({
    insets,
    theme: themeName,
    styles: themeName === 'dark' ? darkTheme : theme,
    changeTheme,
  }), [ themeName, changeTheme, insets ])

  if (!isMounted()) {
    applyTheme(themeName)
  }

  useHandleMounted()

  useLayoutEffect(() => {
    handleSafeArea({
      onInit: setInsets,
      onChange: setInsets,
    })
  }, [])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useThemeContext = (): ThemeContextType => useContext(ThemeContext)

export default ThemeContextProvider