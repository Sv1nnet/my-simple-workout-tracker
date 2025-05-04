import styled from 'styled-components'
import { List } from 'antd'
import { theme } from 'src/styles/vars'

export const StyledSelectableListItem = styled(List.Item)<{ $selected?: boolean, $noPadding?: boolean }>`
  position: relative;
  flex-wrap: wrap;
  transition: all .3s;
  ${({ $selected }) => `background-color: ${$selected ? theme.ghostPrimaryColor : ''}`};
  ${({ $noPadding }) => $noPadding && 'padding: 0;'};
`
