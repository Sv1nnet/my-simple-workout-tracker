import styled from 'styled-components'
import { List } from 'antd'
import { theme } from 'src/styles/vars'

export const StyledSelectableListItem = styled(List.Item)`
  position: relative;
  transition: all .3s;
  margin-left: -15px;
  margin-right: -15px;
  padding-left: 15px;
  padding-right: 15px;
  ${({ $selected }) => `background-color: ${$selected ? theme.ghostPrimaryColor : ''}`}
`