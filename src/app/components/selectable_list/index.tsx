import React, { useState, useImperativeHandle, ReactElement, MouseEventHandler, ForwardRefExoticComponent, RefAttributes, FC, useMemo, TouchEventHandler } from 'react'
import styled from 'styled-components'
import { ListControls } from 'app/components'
import { StyledSelectableListItem, SelectableModal } from './components'
import { ISelectableModalProps } from './components/modal/SelectableModal'
import AppleContextMenuHandler from 'app/utils/AppleContextMenuHandler'

const ListContainer = styled.div`
  padding: 15px;
  padding-top: 0;
`

export type SelectedListItems = {
  [key: string]: boolean | undefined,
}

export interface ISelectableList {
  list: {
    id: string | number;
  }[];
  onDelete?: Function;
  onCopy?: Function;
  onSelect?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, selected: SelectedListItems, isAllSelected: boolean) => void;
  onCancelSelection?: Function;
  onSelectDeselectAll?: Function;
  isLoading?: boolean;
  isDeleting?: boolean;
  isCopying?: boolean;
  createHref: string;
  children: ((options: {
    selected: object,
    selectionEnabled: boolean,
    isAllSelected: boolean,
    onSelect: React.MouseEventHandler<HTMLElement>,
    onCancelSelection: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void,
    onContextMenu: MouseEventHandler<HTMLElement>,
    onTouchHandlers: {
      onTouchStart: TouchEventHandler;
      onTouchEnd: TouchEventHandler;
      onTouchMove: TouchEventHandler;
      onTouchCancel: TouchEventHandler;
    }
  }) => ReactElement) | ReactElement | ReactElement[];
  style?: React.CSSProperties,
  className?: string,
}

const SelectableList: ForwardRefExoticComponent<
ISelectableList & RefAttributes<{ selected: object; handleCancelSelection: Function; }>
> & { Item?: typeof StyledSelectableListItem }
& { Modal?: FC<ISelectableModalProps> & { useModalUtils: Function }
} = React.forwardRef<{ selected: object, handleCancelSelection: Function }, ISelectableList>((
  {
    children,
    list,
    onDelete,
    onCopy,
    onSelect,
    onCancelSelection,
    onSelectDeselectAll,
    isDeleting,
    isCopying,
    createHref,
    style,
    className,
  },
  ref,
) => {
  const [ selected, setSelected ] = useState<SelectedListItems>({})
  const [ selectionEnabled, setSelectionEnabled ] = useState(false)
  const [ isAllSelected, setIsAllSelected ] = useState(false)

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectionEnabled) {
      e.preventDefault()
      window.getSelection().removeAllRanges()

      setSelectionEnabled(true)

      const { selectableId } = (e.currentTarget || (e.target as HTMLElement).closest('[data-selectable-id]')).dataset || {}

      if (selectableId) {
        if (!selected[selectableId]) setSelected({ ...selected, [selectableId]: true })
        else setSelected({ ...selected, [selectableId]: false })
      } else {
        setSelected({ ...selected })
      }

    }
  }

  const handleSelect = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectionEnabled) return

    const { dataset } = e.currentTarget
    const { selectableId } = dataset
    
    let _isAllSelected = false
    let newSelected = { ...selected }

    if (!selected[selectableId]) {
      newSelected[selectableId] = true
      const selectedKeys = Object
        .keys(newSelected)
        .filter(sel => newSelected[sel])

      if (selectedKeys.length && selectedKeys.length === list.length) {
        _isAllSelected = true
        setIsAllSelected(_isAllSelected)
      }
      setSelected(newSelected)
    } else {
      newSelected[selectableId] = false
      setSelected(newSelected)
      if (isAllSelected) {
        _isAllSelected = false
        setIsAllSelected(_isAllSelected)
      }
    }
    if (typeof onSelect === 'function') onSelect(e, newSelected, _isAllSelected)
  }

  const contextMenuHandler = useMemo(() => new AppleContextMenuHandler(handleContextMenu), [ handleContextMenu, selectionEnabled, selected ])

  const handleSelectDeselectAll = (shouldSelect: boolean) => {
    setSelected(list.reduce((acc, { id }) => { acc[id] = shouldSelect; return acc }, {}))
    setIsAllSelected(shouldSelect)
    if (typeof onSelectDeselectAll === 'function') onSelectDeselectAll(shouldSelect)
  }

  const handleCancelSelection = () => {
    handleSelectDeselectAll(false)
    setSelectionEnabled(false)
    if (typeof onCancelSelection === 'function') onCancelSelection()
  }

  useImperativeHandle(ref, () => ({
    selected,
    selectionEnabled,
    isAllSelected,
    handleSelect,
    handleCancelSelection,
  }), [ selected, selectionEnabled, isAllSelected, handleSelect, handleCancelSelection ])

  return (
    <ListContainer style={style} className={className}>
      {typeof children === 'function'
        ? children({
          selected,
          selectionEnabled,
          isAllSelected,
          onSelect: handleSelect,
          onCancelSelection: handleCancelSelection,
          onContextMenu: handleContextMenu,
          onTouchHandlers: {
            onTouchStart: contextMenuHandler.onTouchStart,
            onTouchCancel: contextMenuHandler.onTouchCancel,
            onTouchEnd: contextMenuHandler.onTouchEnd,
            onTouchMove: contextMenuHandler.onTouchMove,
          },
        })
        : React.Children.map(children, (child: ReactElement) => React.cloneElement(
          child,
          {
            ...child.props,
            selected,
            selectionEnabled,
            isAllSelected,
            onSelect: handleSelect,
            onCancelSelection: handleCancelSelection,
            onContextMenu: handleContextMenu,
            onTouchHandlers: {
              onTouchStart: contextMenuHandler.onTouchStart,
              onTouchCancel: contextMenuHandler.onTouchCancel,
              onTouchEnd: contextMenuHandler.onTouchEnd,
              onTouchMove: contextMenuHandler.onTouchMove,
            },
          },
        ))}
      <ListControls
        createHref={createHref}
        isDeleting={isDeleting}
        isCopying={isCopying}
        selected={selected}
        isAllSelected={isAllSelected}
        onSelect={handleSelectDeselectAll}
        isSelectionActive={selectionEnabled}
        onCancel={handleCancelSelection}
        onCopy={onCopy}
        onDelete={onDelete}
      />
    </ListContainer>
  )
})

SelectableList.Item = StyledSelectableListItem
SelectableList.Modal = SelectableModal

export default SelectableList
