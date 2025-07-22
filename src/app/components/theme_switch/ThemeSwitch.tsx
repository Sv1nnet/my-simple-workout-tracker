import { MoonFilled, SunFilled } from '@ant-design/icons'
import { ThemeSwitchContainer, StyledSwitch } from './components/styled'
import { SwitchChangeEventHandler } from 'antd/lib/switch'

export type ThemeSwitchProps = {
  onChange: SwitchChangeEventHandler
  isLightTheme: boolean
}

const ThemeSwitch = ({ onChange, isLightTheme }: ThemeSwitchProps) => (
  <ThemeSwitchContainer>
    <StyledSwitch className="theme-switch" onChange={onChange} checked={isLightTheme} checkedChildren={<SunFilled />} unCheckedChildren={<MoonFilled />} />
  </ThemeSwitchContainer>
)

export default ThemeSwitch
