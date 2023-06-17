import { MainButtonContainer, MoreOptionsButtonContainer } from '../styled'
import { useEffect, useState } from 'react'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { CancelSelectionButton, CopyButton, CreateButton, DeleteButton, DeselectAllButton, SelectAllButton } from './components/styled'

const ListControls = ({ createHref, isDeleting, isCopying, isSelectionActive, selected, isAllSelected, onDelete, onCopy, onCancel, onSelect }) => {
  const { list_buttons } = useIntlContext().intl.pages.exercises
  const [ expanded, setExpanded ] = useState(false)

  const handleListAll = () => onSelect(true)
  const handleDeselectAll = () => onSelect(false)

  useEffect(() => {
    if (!isSelectionActive && expanded) setExpanded(false)
  }, [ isSelectionActive ])

  const activeExtraButtons = +!!onCopy + +!!onDelete
  const buttonPositionShift = activeExtraButtons * 50
  const style = isSelectionActive ? { transform: `translateX(-${50 + buttonPositionShift}px)` } : {}
  
  return (
    <MainButtonContainer>
      {createHref && <CreateButton tooltipTitle={list_buttons.create} href={createHref} />}
      <MoreOptionsButtonContainer $expanded={isSelectionActive} $items={activeExtraButtons}>
        <MoreOptionsButtonContainer.Inner>
          {
            isAllSelected
              ? <DeselectAllButton $activeItems={activeExtraButtons} style={style} tooltipTitle={list_buttons.deselect_all} onClick={handleDeselectAll} />
              : <SelectAllButton $activeItems={activeExtraButtons} style={style} tooltipTitle={list_buttons.select_all} onClick={handleListAll} />
          }
          {onCopy && (
            <CopyButton $activeItems={activeExtraButtons} style={style} loading={isCopying} disabled={!Object.values(selected).some(Boolean)} onClick={onCopy} />
          )}
          {onDelete && (
            <DeleteButton $activeItems={activeExtraButtons} style={style} loading={isDeleting} disabled={!Object.values(selected).some(Boolean)} onClick={onDelete} />
          )}
          <CancelSelectionButton $activeItems={activeExtraButtons} tooltipTitle={list_buttons.cancel_selection} $isSelectionActive={isSelectionActive} onClick={onCancel} />
        </MoreOptionsButtonContainer.Inner>
      </MoreOptionsButtonContainer>
    </MainButtonContainer>
  )
}
export default ListControls
