import React from 'react'
import styled from 'styled-components'
import { Button as AntButton, Tooltip } from 'antd'
import {
  PlusOutlined,
  StopOutlined,
  BarsOutlined,
  SwitcherOutlined,
  DeleteOutlined,
  LeftOutlined,
  RightOutlined,
  CopyOutlined,
} from '@ant-design/icons'
import Link from 'next/link'

export const StyledButton = styled(AntButton)`
  z-index: 999;
  transform: ${({ $activeItems }) => `translateX(-${50 + $activeItems * 50}px)`};
  ${({ $isSelectionActive, $isCancel, $isDelete, $isCopy, $isCreate, $isMoreOptions, $expanded, $activeItems }) => (
    $isCancel && `
      margin-left: 60px;
      transition: .3s all;
      ${$isSelectionActive ? `transform: translateX(-${100 + $activeItems * 50}px);` : `transform: translateX(-${$activeItems * 50}px);`}
    ` ||
    ($isDelete || $isCopy) && 'margin-left: 10px;' ||
    $isCreate && 'transform: translateX(0);' ||
    $isMoreOptions && `
      position: fixed;
      transform: translateX(${$expanded ? '-145px' : '-45px'});
      transition-timing-function: ease-out;
    ` ||
    '')}
  & svg {
    ${({ $isMoreOptions, $expanded }) => $isMoreOptions ? `transform: scale(${$expanded ? '-.9' : '.9'}, 1.5);` : ''}
  }
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
}>(({
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
export const CreateButton = ({ href, ...props }) => (
  <Link href={href}>
    <ListButton $isCreate icon={<PlusOutlined />} {...props} />
  </Link>
)
export const CancelSelectionButton = props => <ListButton isCancel danger type={undefined} icon={<StopOutlined />} {...props} />
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
