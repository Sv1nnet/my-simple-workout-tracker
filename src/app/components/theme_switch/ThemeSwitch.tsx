import { MoonFilled, SunFilled } from '@ant-design/icons'
import { ThemeSwitchContainer, StyledSwitch } from './components/styled'
import { SwitchChangeEventHandler, SwitchProps } from 'antd/lib/switch'

export type ThemeSwitchProps = {
  onChange: SwitchChangeEventHandler
  isLightTheme: boolean
  className?: string
  containerProps?: React.HTMLAttributes<HTMLDivElement>
  switchProps?: SwitchProps
}

const ThemeSwitch = ({ onChange, isLightTheme, className, containerProps, switchProps }: ThemeSwitchProps) => (
  <ThemeSwitchContainer className={className} {...containerProps}>
    <StyledSwitch className="theme-switch" onChange={onChange} checked={isLightTheme} checkedChildren={<SunFilled />} unCheckedChildren={<MoonFilled />} {...switchProps} />
  </ThemeSwitchContainer>
)

export default ThemeSwitch
