import React, { useState, useImperativeHandle, ReactElement, MouseEventHandler, ForwardRefExoticComponent, RefAttributes, FC } from 'react'
import styled from 'styled-components'
import { ListControls } from 'app/components'
import { StyledSelectableListItem, SelectableModal } from './components'
import { ISelectableModalProps } from './components/modal/SelectableModal'

const ListContainer = styled.div`
  padding: 15px;
  padding-top: 0;
`

export interface ISelectableList {
  list: {
    id: string | number;
  }[];
  onDelete: Function;
  onSelect?: Function;
  onCancelSelection?: Function;
  onSelectDeselectAll?: Function;
  isLoading?: boolean;
  createHref: string;
  children: ((options: {
    selected: object,
    selectionEnabled: boolean,
    allSelected: boolean,
    onSelect: React.MouseEventHandler<HTMLElement>,
    onCancelSelection: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void,
    onContextMenu: MouseEventHandler<HTMLElement>,
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
    onSelect,
    onCancelSelection,
    onSelectDeselectAll,
    isLoading,
    createHref,
    style,
    className,
  },
  ref,
) => {
  const [ selected, setSelected ] = useState({})
  const [ selectionEnabled, setSelectionEnabled ] = useState(false)
  const [ allSelected, setAllSelected ] = useState(false)

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectionEnabled) {
      e.preventDefault()
      setSelectionEnabled(true)

      const { dataset } = e.currentTarget
      const { selectableId } = dataset

      if (!selected[selectableId]) setSelected({ ...selected, [selectableId]: true })
      else setSelected({ ...selected, [selectableId]: false })
    }
  }

  const handleSelect = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectionEnabled) return

    const { dataset } = e.currentTarget
    const { selectableId } = dataset
    
    let _allSelected = false
    let newSelected = { ...selected }

    if (!selected[selectableId]) {
      newSelected[selectableId] = true
      const selectedKeys = Object
        .keys(newSelected)
        .filter(sel => newSelected[sel])

      if (selectedKeys.length && selectedKeys.length === list.length) {
        _allSelected = true
        setAllSelected(_allSelected)
      }
      setSelected(newSelected)
    } else {
      newSelected[selectableId] = false
      setSelected(newSelected)
      if (allSelected) {
        _allSelected = false
        setAllSelected(_allSelected)
      }
    }
    if (typeof onSelect === 'function') onSelect(e, newSelected, _allSelected)
  }

  const handleSelectDeselectAll = (shouldSelect: boolean) => {
    setSelected(list.reduce((acc, { id }) => { acc[id] = shouldSelect; return acc }, {}))
    setAllSelected(shouldSelect)
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
    allSelected,
    handleSelect,
    handleCancelSelection,
  }), [ selected, selectionEnabled, allSelected, handleSelect, handleCancelSelection ])

  return (
    <ListContainer style={style} className={className}>
      {typeof children === 'function'
        ? children({
          selected,
          selectionEnabled,
          allSelected,
          onSelect: handleSelect,
          onCancelSelection: handleCancelSelection,
          onContextMenu: handleContextMenu,
        })
        : React.Children.map(children, (child: ReactElement) => React.cloneElement(
          child,
          {
            ...child.props,
            selected,
            selectionEnabled,
            allSelected,
            onSelect: handleSelect,
            onCancelSelection: handleCancelSelection,
            onContextMenu: handleContextMenu,
          },
        ))}
      <ListControls
        createHref={createHref}
        isDeleteFetching={isLoading}
        selected={selected}
        allSelected={allSelected}
        onSelect={handleSelectDeselectAll}
        isSelectionActive={selectionEnabled}
        onCancel={handleCancelSelection}
        onDelete={onDelete}
      />
    </ListContainer>
  )
})

SelectableList.Item = StyledSelectableListItem
SelectableList.Modal = SelectableModal

export default SelectableList
