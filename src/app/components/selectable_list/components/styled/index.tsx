import styled from 'styled-components'
import { List } from 'antd'

export const StyledSelectableListItem = styled(List.Item)<{ $selected?: boolean, $noPadding?: boolean }>`
  position: relative;
  flex-wrap: wrap;
  transition: all .3s;
  ${({ $selected }) => `background-color: ${$selected ? 'var(--selected-list-item-color);' : ''}`};
  ${({ $noPadding }) => $noPadding && 'padding: 0;'};

  &.ant-list-item {
    border-bottom-color: var(--border-color-base);
  }
`
