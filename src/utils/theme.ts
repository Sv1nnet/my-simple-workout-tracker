import { Preferences } from '@capacitor/preferences'
import { Style } from '@capacitor/status-bar'
import { darkTheme, theme } from 'src/styles/vars'
import { useLayoutEffect } from 'react'
import { useThemeContext } from 'app/contexts/theme/ThemeContextProvider'
import { Theme } from 'app/store/slices/settings/types'

// Theme constants
export const LIGHT_THEME_CLASS = 'light-theme'
export const DARK_THEME_CLASS = 'dark-theme'
export const NAVIGATION_BAR_LIGHT = { darkButtons: true, color: '#ffffff' }
export const NAVIGATION_BAR_DARK = { darkButtons: false, color: '#000000' }
export const STATUS_BAR_LIGHT = { style: Style.Light }
export const STATUS_BAR_DARK = { style: Style.Dark }
export const STATUS_BAR_LIGHT_BG = theme.primaryColor
export const STATUS_BAR_DARK_BG = darkTheme.primaryColor

// Key for storing theme preference
export const THEME_PREFERENCE_KEY = 'theme-mode'

// Function to get the current system theme
export const getSystemTheme = (): 'light' | 'dark' => {
  // Check if window.matchMedia is available (web environment)
  if (window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  
  // Default to light if matchMedia is not available
  return 'light'
}

// Function to set theme in the UI
export const applyTheme = async (themeMode: 'light' | 'dark' | 'system'): Promise<void> => {
  let currentTheme = themeMode === 'dark' ? LIGHT_THEME_CLASS : DARK_THEME_CLASS
  let newTheme = themeMode === 'dark' ? DARK_THEME_CLASS : LIGHT_THEME_CLASS

  // Remove current theme class and add new theme class
  document.body.classList.remove(currentTheme)
  document.body.classList.add(newTheme)


  // Set status bar and navigation bar
  try {
    // const _statusBarStyle = themeMode === 'dark' ? STATUS_BAR_DARK : STATUS_BAR_LIGHT
    // const _statusBarColor = themeMode === 'dark' ? STATUS_BAR_DARK_BG : STATUS_BAR_LIGHT_BG
    // const _navigationBarColor = themeMode === 'dark' ? NAVIGATION_BAR_DARK : NAVIGATION_BAR_LIGHT

    // await NavigationBar.setColor(_navigationBarColor)
    // await Style.setStyle(_statusBarStyle)
    // await StatusBar.setBackgroundColor({ color: _statusBarColor })
  } catch (error) {
    console.error('Error setting theme for status/navigation bar:', error)
  }
}

// Function to get the saved theme preference
export const getSavedThemePreference = async (): Promise<Theme> => {
  try {
    const { value } = await Preferences.get({ key: THEME_PREFERENCE_KEY })
    return (value as Theme) || 'system'
  } catch (error) {
    console.error('Error getting theme preference:', error)
    return 'system'
  }
}

export const useSystemTheme = (currentTheme: Theme) => {
  const themeCtx = useThemeContext()
  // Apply system theme to navigation and status bars
  useLayoutEffect(() => {
    const abortController = new AbortController()

    const applySystemThemeToNativeBars = async () => {
      try {
        // First check if there's a saved preference
        const savedTheme = currentTheme || await getSavedThemePreference()
        
        // If the preference is 'system' or undefined, use the system theme
        const themeToApply = savedTheme === 'system' ? getSystemTheme() : savedTheme
        
        // Apply theme including the status bar background color
        await applyTheme(themeToApply)
        themeCtx.changeTheme(themeToApply)

        // Add listener for system theme changes if preference is 'system'
        if (savedTheme === 'system' && window.matchMedia) {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
          
          const handleThemeChange = async (e: MediaQueryListEvent) => {
            const newTheme = e.matches ? 'dark' : 'light'
            await applyTheme(newTheme)
            themeCtx.changeTheme(newTheme)
          }
          
          mediaQuery.addEventListener('change', handleThemeChange, { signal: abortController.signal })
        }
      } catch (error) {
        console.error('Error applying system theme:', error)
      }
    }
    
    // Apply theme immediately and again after a short delay to ensure it's applied after app initialization
    // since the system theme change event is not triggered on app initialization on some android devices
    applySystemThemeToNativeBars()
    
    return () => {
      abortController.abort()
    }
  }, [])
}
