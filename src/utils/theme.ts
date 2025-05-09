import { Preferences } from '@capacitor/preferences'
import { StatusBar, Style } from '@capacitor/status-bar'
import { NavigationBar } from '@hugotomazi/capacitor-navigation-bar'
import { theme } from 'src/styles/vars'
import { useEffect } from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'

// Theme constants
export const LIGHT_THEME_CLASS = 'light-theme'
export const DARK_THEME_CLASS = 'dark-theme'
export const NAVIGATION_BAR_LIGHT = { darkButtons: true, color: '#ffffff' }
export const NAVIGATION_BAR_DARK = { darkButtons: false, color: '#000000' }
export const STATUS_BAR_LIGHT = { style: Style.Dark }
export const STATUS_BAR_DARK = { style: Style.Dark }
export const STATUS_BAR_LIGHT_BG = theme.primaryColor
export const STATUS_BAR_DARK_BG = theme.primaryColorDark

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
export const applyTheme = async (themeMode: 'light' | 'dark'): Promise<void> => {
  let themeToRemove = DARK_THEME_CLASS
  let themeToAdd = LIGHT_THEME_CLASS
  let navigationBarColor = NAVIGATION_BAR_LIGHT
  let statusBarStyle = STATUS_BAR_LIGHT
  let statusBarColor = STATUS_BAR_LIGHT_BG

  if (themeMode === 'dark') {
    themeToRemove = LIGHT_THEME_CLASS
    themeToAdd = DARK_THEME_CLASS
    navigationBarColor = NAVIGATION_BAR_DARK
    statusBarStyle = STATUS_BAR_DARK
    statusBarColor = STATUS_BAR_DARK_BG
  }

  // Apply light theme styles
  document.body.classList.remove(themeToRemove)
  document.body.classList.add(themeToAdd)

  // Set status bar and navigation bar for light theme
  try {
    await NavigationBar.setColor(navigationBarColor)
    await StatusBar.setStyle(statusBarStyle)
    await StatusBar.setBackgroundColor({ color: statusBarColor })
  } catch (error) {
    console.error('Error setting light theme for status/navigation bar:', error)
  }
}

// Function to get the saved theme preference
export const getSavedThemePreference = async (): Promise<ThemeMode> => {
  try {
    const { value } = await Preferences.get({ key: THEME_PREFERENCE_KEY })
    return (value as ThemeMode) || 'system'
  } catch (error) {
    console.error('Error getting theme preference:', error)
    return 'system'
  }
}

export const useSystemTheme = () => {
  // Apply system theme to navigation and status bars
  useEffect(() => {
    const abortController = new AbortController()

    const applySystemThemeToNativeBars = async () => {
      try {
        // First check if there's a saved preference
        const savedTheme = await getSavedThemePreference()
        
        // If the preference is 'system' or undefined, use the system theme
        const themeToApply = savedTheme === 'system' ? getSystemTheme() : savedTheme
        
        // Apply theme including the status bar background color
        await applyTheme(themeToApply)

        // Add listener for system theme changes if preference is 'system'
        if (savedTheme === 'system' && window.matchMedia) {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
          
          const handleThemeChange = (e: MediaQueryListEvent) => {
            const newTheme = e.matches ? 'dark' : 'light'
            applyTheme(newTheme)
          }
          
          mediaQuery.addEventListener('change', handleThemeChange, { signal: abortController.signal })
        }
      } catch (error) {
        console.error('Error applying system theme to navigation bars:', error)
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
