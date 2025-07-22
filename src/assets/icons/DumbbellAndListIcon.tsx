/* eslint-disable max-len */
import { SVGProps } from 'react'
import { useThemeContext } from 'app/contexts/theme/ThemeContextProvider'

const DumbbellAndListIcon = (props: SVGProps<SVGSVGElement>) => {
  const { styles } = useThemeContext()

  return (
    <svg width="62" height="60" viewBox="0 0 62 60" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path fill="transparent" d="M8 47V43C8 42.4477 7.46274 42 6.8 42H3.2C2.53726 42 2 42.4477 2 43V47C2 47.5523 2.53726 48 3.2 48H6.8C7.46274 48 8 47.5523 8 47Z" stroke={styles.navIconColor} stroke-width="3"/>
      <path fill="transparent" d="M20 57V33C20 32.4477 19.5522 32 19 32H15C14.4477 32 14 32.4477 14 33V57C14 57.5523 14.4477 58 15 58H19C19.5522 58 20 57.5523 20 57Z" stroke={styles.navIconColor} stroke-width="3"/>
      <path fill="transparent" d="M13.9999 53V37C13.9999 36.4478 13.5522 36 12.9999 36H8.99995C8.44766 36 7.99995 36.4478 7.99995 37V53C7.99995 53.5523 8.44766 54 8.99995 54H12.9999C13.5522 54 13.9999 53.5523 13.9999 53Z" stroke={styles.navIconColor} stroke-width="3"/>
      <path fill="transparent" d="M42 42.0001H20V48.0001H42V42.0001Z" stroke={styles.navIconColor} stroke-width="3"/>
      <path fill="transparent" d="M54 47V43C54 42.4477 54.5372 42 55.2 42H58.8C59.4627 42 60 42.4477 60 43V47C60 47.5523 59.4627 48 58.8 48H55.2C54.5372 48 54 47.5523 54 47Z" stroke={styles.navIconColor} stroke-width="3"/>
      <path fill="transparent" d="M42 57V33C42 32.4477 42.4477 32 43 32L47 32C47.5523 32 48 32.4477 48 33V57C48 57.5523 47.5523 58 47 58L43 58C42.4477 58 42 57.5523 42 57Z" stroke={styles.navIconColor} stroke-width="3"/>
      <path fill="transparent" d="M48 53V37C48 36.4478 48.4477 36 49 36H53C53.5523 36 54 36.4478 54 37V53C54 53.5523 53.5523 54 53 54H49C48.4477 54 48 53.5523 48 53Z" stroke={styles.navIconColor} stroke-width="3"/>
      <circle cx="20.5" cy="8.5" r="1.5" fill={styles.navIconColor}/>
      <line x1="25.5" y1="8.5" x2="40.5" y2="8.5" stroke={styles.navIconColor} stroke-width="3" stroke-linecap="round"/>
      <circle cx="20.5" cy="15.5" r="1.5" fill={styles.navIconColor}/>
      <line x1="25.5" y1="15.5" x2="40.5" y2="15.5" stroke={styles.navIconColor} stroke-width="3" stroke-linecap="round"/>
      <circle cx="20.5" cy="22.5" r="1.5" fill={styles.navIconColor}/>
      <line x1="25.5" y1="22.5" x2="40.5" y2="22.5" stroke={styles.navIconColor} stroke-width="3" stroke-linecap="round"/>
      <circle cx="20.5" cy="22.5" r="1.5" fill={styles.navIconColor}/>
      <line x1="25.5" y1="22.5" x2="40.5" y2="22.5" stroke={styles.navIconColor} stroke-width="3" stroke-linecap="round"/>
      <path d="M15.5 27L15.5 2" stroke={styles.navIconColor} stroke-width="3" stroke-linecap="round"/>
      <path d="M46 27V2" stroke={styles.navIconColor} stroke-width="3" stroke-linecap="round"/>
      <path d="M46 2L16 2" stroke={styles.navIconColor} stroke-width="3" stroke-linecap="round"/>
    </svg>
  )
}

export default DumbbellAndListIcon
