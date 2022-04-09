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
} from '@ant-design/icons'
import { MainButtonContainer, MoreOptionsButtonContainer } from '../styled'
import React, { useContext, useEffect, useState } from 'react'
import { IntlContext } from '@/src/app/contexts/intl/IntContextProvider'
import Link from 'next/link'

const StyledButton = styled(AntButton)`
  z-index: 999;
  transform: translateX(-100px);
  ${({ $isSelectionActive, $isCancel, $isDelete, $isCreate, $isMoreOptions, $expanded }) => (
    $isCancel && `
      margin-left: 60px;
      transition: .3s all;
      ${$isSelectionActive ? 'transform: translateX(-150px);' : ''}
    ` ||
    $isDelete && 'margin-left: 10px;' ||
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

const ListButton = React.forwardRef<unknown, { $isCreate?: boolean, tooltipTitle?: string, isCancel?: boolean, isDelete?: boolean, isMoreOptions?: boolean, icon: React.ReactElement }>(({
  tooltipTitle,
  isCancel,
  isDelete,
  isMoreOptions,
  ...props
}, _) => (
  <Tooltip title={tooltipTitle}>
    <StyledButton $isCancel={isCancel} $isDelete={isDelete} $isMoreOptions={isMoreOptions} className="list-btn" type="primary" shape="circle" size="large" {...props} />
  </Tooltip>
))

const MoreOptionsButton = props => <ListButton isMoreOptions type="text" icon={props.expanded ? <RightOutlined /> : <LeftOutlined />} {...props} />
const CreateButton = ({ href, ...props }) => (
  <Link href={href}>
    <ListButton $isCreate icon={<PlusOutlined />} {...props} />
  </Link>
)
const CancelSelectionButton = props => <ListButton isCancel danger type={undefined} icon={<StopOutlined />} {...props} />
const SelectAllButton = props => <ListButton icon={<BarsOutlined />} {...props} />
const DeselectAllButton = props => <ListButton icon={<SwitcherOutlined />} {...props} />
const DeleteButton = props => <ListButton isDelete style={!props.disabled ? { background: '#cf1322', borderColor: '#cf1322' } : {}} icon={<DeleteOutlined />} {...props} />

const ListControls = ({ createHref, isDeleteFetching, isSelectionActive, selected, allSelected, onDelete, onCancel, onSelect }) => {
  const { list_buttons } = useContext(IntlContext).intl.pages.exercises
  const [ expanded, setExpanded ] = useState(false)

  const handleShowMoreOptions = () => setExpanded(_expanded => !_expanded)

  const handleListAll = () => onSelect(true)
  const handleDeselectAll = () => onSelect(false)

  useEffect(() => {
    if (!isSelectionActive && expanded) setExpanded(false)
  }, [ isSelectionActive ])
  
  return (
    <MainButtonContainer>
      {createHref && <CreateButton tooltipTitle={list_buttons.create} href={createHref} disabled={isDeleteFetching} />}
      {isSelectionActive && <MoreOptionsButton $expanded={expanded} tooltipTitle={list_buttons.more_options} onClick={handleShowMoreOptions} />}
      <MoreOptionsButtonContainer $expanded={expanded}>
        <MoreOptionsButtonContainer.Inner>
          {
            allSelected
              ? <DeselectAllButton tooltipTitle={list_buttons.deselect_all} onClick={handleDeselectAll} />
              : <SelectAllButton tooltipTitle={list_buttons.select_all} onClick={handleListAll} />
          }
          <DeleteButton loading={isDeleteFetching} disabled={!Object.values(selected).some(Boolean)} onClick={onDelete} />
          <CancelSelectionButton tooltipTitle={list_buttons.cancel_selection} $isSelectionActive={isSelectionActive} onClick={onCancel} />
        </MoreOptionsButtonContainer.Inner>
      </MoreOptionsButtonContainer>
    </MainButtonContainer>
  )
}
export default ListControls
