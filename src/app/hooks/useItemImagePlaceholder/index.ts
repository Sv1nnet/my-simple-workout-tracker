import {
  lightImage as lightItemImagePlaceholder,
  darkImage as darkItemImagePlaceholder,
} from 'constants/item_image_placeholder'
import { useThemeContext } from 'app/contexts/theme/ThemeContextProvider'
import { useEffect, useState } from 'react'

const useItemImagePlaceholder = (): [string, React.Dispatch<React.SetStateAction<string>>] => {
  const { theme } = useThemeContext()
  const [ itemImagePlaceholder, setItemImagePlaceholder ] = useState(() =>
    theme === 'dark'
      ? darkItemImagePlaceholder
      : theme === 'light'
        ? lightItemImagePlaceholder
        : window.matchMedia('(prefers-color-scheme: dark)').matches
          ? darkItemImagePlaceholder
          : lightItemImagePlaceholder)

  useEffect(() => {
    setItemImagePlaceholder(theme === 'dark' ? darkItemImagePlaceholder : lightItemImagePlaceholder)
  }, [ theme ])

  return [ itemImagePlaceholder, setItemImagePlaceholder ]
}

export default useItemImagePlaceholder
