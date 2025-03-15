import { Preferences } from '@capacitor/preferences'
import { StatusBar, Style } from '@capacitor/status-bar'
import { NavigationBar } from '@hugotomazi/capacitor-navigation-bar'
import { useEffect, useRef } from 'react'

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system'

// Theme constants
export const NAVIGATION_BAR_LIGHT = { darkButtons: true, color: '#ffffff' }
export const NAVIGATION_BAR_DARK = { darkButtons: false, color: '#000000' }
export const STATUS_BAR_LIGHT = { style: Style.Light }
export const STATUS_BAR_DARK = { style: Style.Dark }
export const STATUS_BAR_LIGHT_BG = '#ffffff'
export const STATUS_BAR_DARK_BG = '#000000'

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
export const applyTheme = async (theme: 'light' | 'dark'): Promise<void> => {
  if (theme === 'light') {
    // Apply light theme styles
    document.body.classList.remove('dark-theme')
    document.body.classList.add('light-theme')
    
    // Set status bar and navigation bar for light theme
    try {
      await NavigationBar.setColor(NAVIGATION_BAR_LIGHT)
      await StatusBar.setStyle(STATUS_BAR_LIGHT)
      await StatusBar.setBackgroundColor({ color: STATUS_BAR_LIGHT_BG })
    } catch (error) {
      console.error('Error setting light theme for status/navigation bar:', error)
    }
  } else {
    // Apply dark theme styles
    document.body.classList.remove('light-theme')
    document.body.classList.add('dark-theme')
    
    // Set status bar and navigation bar for dark theme
    try {
      await NavigationBar.setColor(NAVIGATION_BAR_DARK)
      await StatusBar.setStyle(STATUS_BAR_DARK)
      await StatusBar.setBackgroundColor({ color: STATUS_BAR_DARK_BG })
    } catch (error) {
      console.error('Error setting dark theme for status/navigation bar:', error)
    }
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
  const changeHandlerTimeoutIdRef = useRef<NodeJS.Timeout | null>(null)
  const systemChangeTimeoutIdRef = useRef<NodeJS.Timeout | null>(null)

  // Apply system theme to navigation and status bars
  useEffect(() => {
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
            if (changeHandlerTimeoutIdRef.current) {
              clearTimeout(changeHandlerTimeoutIdRef.current)
            }
            const newTheme = e.matches ? 'dark' : 'light'
            
            // Apply theme immediately and again after a short delay to ensure it's applied after app initialization
            // since the system theme change event is not triggered on app initialization on open after theme changed
            applyTheme(newTheme)
            changeHandlerTimeoutIdRef.current = setTimeout(() => {
              applyTheme(newTheme)
            }, 2000)
          }
          
          mediaQuery.addEventListener('change', handleThemeChange)
          
          // Clean up the listener when component unmounts
          return () => {
            if (changeHandlerTimeoutIdRef.current) {
              clearTimeout(changeHandlerTimeoutIdRef.current)
            }
            if (systemChangeTimeoutIdRef.current) {
              clearTimeout(systemChangeTimeoutIdRef.current)
            }
            mediaQuery.removeEventListener('change', handleThemeChange)
          }
        }
      } catch (error) {
        console.error('Error applying system theme to navigation bars:', error)
      }
    }
    
    // Apply theme immediately and again after a short delay to ensure it's applied after app initialization
    // since the system theme change event is not triggered on app initialization on some android devices
    applySystemThemeToNativeBars()
    systemChangeTimeoutIdRef.current = setTimeout(applySystemThemeToNativeBars, 3000)
  }, [])
}
