import React from 'react'
import styled from 'styled-components'
import { Button as AntButton, ButtonProps as AntButtonProps, Tooltip } from 'antd'
import {
  PlusOutlined,
  CloseOutlined,
  BarsOutlined,
  SwitcherOutlined,
  DeleteOutlined,
  LeftOutlined,
  RightOutlined,
  CopyOutlined,
} from '@ant-design/icons'
import { Link } from 'react-router-dom'

export const StyledButton = styled(AntButton)<{
  $isSelectionActive?: boolean,
  $isCancel?: boolean,
  $isDelete?: boolean,
  $isCopy?: boolean,
  $isCreate?: boolean,
  $isMoreOptions?: boolean,
  $expanded?: boolean,
  $activeItems?: number,
}>`
  z-index: 998;

  &.ant-btn:not(.ant-btn-dangerous) {
    border-color: var(--primary-color-light);

    &.ant-btn-primary[disabled] {
      background: var(--disabled-background-color);
      color: var(--disabled-color);
      border-color: var(--disabled-color);
    } 
  }

  & svg {
    ${({ $isMoreOptions, $expanded }) => $isMoreOptions ? `transform: scale(${$expanded ? '-.9' : '.9'}, 1.5);` : ''}
  }
`

export const StyledLink = styled(Link)<{ $expanded?: boolean }>`
  transition: .23s all;
  transition-delay: .07s;
  display: inline-block;
  transform: ${({ $expanded }) => $expanded ? 'translateX(100%)' : 'translateX(0px)'};
`

export const ListButton = React.forwardRef<
unknown,
{
  $isCreate?: boolean,
  tooltipTitle?: string,
  isCancel?: boolean,
  isCopy?: boolean,
  isDelete?: boolean,
  isMoreOptions?: boolean,
  icon: React.ReactElement,
} & AntButtonProps>(({
  tooltipTitle,
  isCancel,
  isDelete,
  isMoreOptions,
  isCopy,
  ...props
}, _) => (
  <Tooltip title={tooltipTitle}>
    <StyledButton $isCancel={isCancel} $isDelete={isDelete} $isCopy={isCopy} $isMoreOptions={isMoreOptions} className="list-btn" type="primary" shape="circle" size="large" {...props} />
  </Tooltip>
))

export const MoreOptionsButton = props => <ListButton isMoreOptions type="text" icon={props.expanded ? <RightOutlined /> : <LeftOutlined />} {...props} />
export const CreateButton = ({ href, $expanded, ...props }) => (
  <StyledLink to={href} $expanded={$expanded}>
    <ListButton $isCreate icon={<PlusOutlined />} {...props} />
  </StyledLink>
)
export const CancelSelectionButton = props => <ListButton isCancel danger type={undefined} icon={<CloseOutlined />} {...props} />
export const SelectAllButton = props => <ListButton icon={<BarsOutlined />} {...props} />
export const DeselectAllButton = props => <ListButton icon={<SwitcherOutlined />} {...props} />
export const CopyButton = props => <ListButton isCopy icon={<CopyOutlined />} {...props} />
export const DeleteButton = props => (
  <ListButton
    isDelete
    {...props}
    style={!props.disabled ? { background: '#cf1322', borderColor: '#cf1322', ...props.style } : props.style}
    icon={<DeleteOutlined />}
  />
)
