import { MainButtonContainer, MoreOptionsButtonContainer } from '../styled'
import React, { useContext, useEffect, useState } from 'react'
import { IntlContext } from '@/src/app/contexts/intl/IntContextProvider'
import { useRouterContext } from '@/src/app/contexts/router/RouterContextProvider'
import { CancelSelectionButton, CreateButton, DeleteButton, DeselectAllButton, MoreOptionsButton, SelectAllButton } from './components/styled'

const ListControls = ({ createHref, isDeleting, isSelectionActive, selected, allSelected, onDelete, onCancel, onSelect }) => {
  const { list_buttons } = useContext(IntlContext).intl.pages.exercises
  const { loading, loadingRoute } = useRouterContext()
  const [ expanded, setExpanded ] = useState(false)

  const handleShowMoreOptions = () => setExpanded(_expanded => !_expanded)

  const handleListAll = () => onSelect(true)
  const handleDeselectAll = () => onSelect(false)

  useEffect(() => {
    if (!isSelectionActive && expanded) setExpanded(false)
  }, [ isSelectionActive ])
  
  return (
    <MainButtonContainer>
      {createHref && <CreateButton loading={loading && loadingRoute === createHref} tooltipTitle={list_buttons.create} href={createHref} />}
      {isSelectionActive && <MoreOptionsButton $expanded={expanded} tooltipTitle={list_buttons.more_options} onClick={handleShowMoreOptions} />}
      <MoreOptionsButtonContainer $expanded={expanded}>
        <MoreOptionsButtonContainer.Inner>
          {
            allSelected
              ? <DeselectAllButton tooltipTitle={list_buttons.deselect_all} onClick={handleDeselectAll} />
              : <SelectAllButton tooltipTitle={list_buttons.select_all} onClick={handleListAll} />
          }
          <DeleteButton loading={isDeleting} disabled={!Object.values(selected).some(Boolean)} onClick={onDelete} />
          <CancelSelectionButton tooltipTitle={list_buttons.cancel_selection} $isSelectionActive={isSelectionActive} onClick={onCancel} />
        </MoreOptionsButtonContainer.Inner>
      </MoreOptionsButtonContainer>
    </MainButtonContainer>
  )
}
export default ListControls
