import React, {
  useState,
  useImperativeHandle,
  ReactElement,
  MouseEventHandler,
  ForwardRefExoticComponent,
  RefAttributes,
  FC,
  useMemo,
  TouchEventHandler,
  useRef,
  useEffect,
  createContext,
  useCallback,
  useContext,
} from 'react'
import styled from 'styled-components'
import { ListControls } from 'app/components'
import { StyledSelectableListItem, SelectableModal } from './components'
import { ISelectableModalProps } from './components/modal/SelectableModal'
import AppleContextMenuHandler from 'app/utils/AppleContextMenuHandler'
import { isFunction } from 'app/utils/typeCheckers'

const ListContainer = styled.div`
  padding: 15px;
  padding-top: 0;
`

const SelectableListContext = createContext<{
  isSelectionEnabled: boolean
  isAllSelected: boolean
  selected: SelectedListItems
  cancelSelection: () => void
  select: (e: React.MouseEvent<HTMLDivElement>) => void
  enableSelection: () => void
  disableSelection: () => void
  selectAll: () => void
  deselectAll: () => void
}>({
      isSelectionEnabled: false,
      isAllSelected: false,
      selected: {},
      cancelSelection: () => {},
      select: () => {},
      enableSelection: () => {},
      disableSelection: () => {},
      selectAll: () => {},
      deselectAll: () => {},
    })

export type SelectedListItems = {
  [key: string]: boolean | undefined,
}

export interface ISelectableList {
  list: {
    id: string | number;
  }[];

  isDisabled?: boolean;
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
    isSelectionEnabled: boolean,
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
  style?: React.CSSProperties;
  className?: string;
  createTooltipTitle?: string;
  addButtonIcon?: React.ReactElement;
}

export type SelectableListRef = {
  selected: SelectedListItems
  isSelectionEnabled: boolean
  isAllSelected: boolean
  select: (e: React.MouseEvent<HTMLDivElement>) => void
  cancelSelection: () => void
  $listEl: React.RefObject<HTMLDivElement>
}

const SelectableList: ForwardRefExoticComponent<
ISelectableList & RefAttributes<SelectableListRef>
> & { Item?: typeof StyledSelectableListItem }
& { Modal?: FC<ISelectableModalProps> & { useModalUtils: Function }
} = React.forwardRef<SelectableListRef, ISelectableList>((
  {
    children,
    list,
    isDisabled,
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
    createTooltipTitle,
    addButtonIcon,
  },
  ref,
) => {
  const [ selected, setSelected ] = useState<SelectedListItems>({})
  const [ isSelectionEnabled, setIsSelectionEnabled ] = useState(false)
  const [ isAllSelected, setIsAllSelected ] = useState(false)
  const $listContainer = useRef<HTMLDivElement>(null)

  const handleContextMenu = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isDisabled) return

    e.preventDefault()
    window.getSelection().removeAllRanges()

    if (!isSelectionEnabled) {
      setIsSelectionEnabled(true)

      const { selectableId } = (e.currentTarget || (e.target as HTMLElement).closest('[data-selectable-id]')).dataset || {}

      if (selectableId) {
        if (!selected[selectableId]) setSelected({ ...selected, [selectableId]: true })
        else setSelected({ ...selected, [selectableId]: false })
      } else {
        setSelected({ ...selected })
      }

    }
  }, [ isDisabled, isSelectionEnabled, selected ])

  const handleSelect = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSelectionEnabled || isDisabled) return

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
    if (isFunction(onSelect)) onSelect(e, newSelected, _isAllSelected)
  }, [ list, onSelect, selected, isAllSelected, isDisabled ])

  const contextMenuHandler = useMemo(() => new AppleContextMenuHandler(handleContextMenu), [ handleContextMenu, isSelectionEnabled, selected ])

  const handleSelectDeselectAll = useCallback((shouldSelect: boolean) => {
    setSelected(list.reduce((acc, { id }) => { acc[id] = shouldSelect; return acc }, {}))
    setIsAllSelected(shouldSelect)
    if (isFunction(onSelectDeselectAll)) onSelectDeselectAll(shouldSelect)
  }, [ list, onSelectDeselectAll ])

  const handleCancelSelection = useCallback(() => {
    handleSelectDeselectAll(false)
    setIsSelectionEnabled(false)
    if (isFunction(onCancelSelection)) onCancelSelection()
  }, [ handleSelectDeselectAll, onCancelSelection ])

  useImperativeHandle(ref, () => ({
    selected,
    isSelectionEnabled,
    isAllSelected,
    select: handleSelect,
    cancelSelection: handleCancelSelection,
    $listEl: $listContainer,
  }), [ selected, isSelectionEnabled, isAllSelected, handleSelect, handleCancelSelection, $listContainer ])

  useEffect(() => {
    if (isDisabled) {
      handleCancelSelection()
    }
  }, [ isDisabled, handleCancelSelection ])

  const value = useMemo(() => ({
    isSelectionEnabled,
    isAllSelected,
    selected,
    cancelSelection: handleCancelSelection,
    select: handleSelect,
    enableSelection: () => setIsSelectionEnabled(true),
    disableSelection: () => setIsSelectionEnabled(false),
    selectAll: () => handleSelectDeselectAll(true),
    deselectAll: () => handleSelectDeselectAll(false),
  }), [ isSelectionEnabled, isAllSelected, selected, handleCancelSelection, handleSelect, handleSelectDeselectAll ])

  return (
    <SelectableListContext.Provider value={value}>
      <ListContainer ref={$listContainer} style={style} className={className}>
        {isFunction(children)
          ? children({
            selected,
            isSelectionEnabled,
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
              isSelectionEnabled,
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
          isSelectionActive={isSelectionEnabled}
          onCancel={handleCancelSelection}
          onCopy={onCopy}
          onDelete={onDelete}
          createTooltipTitle={createTooltipTitle}
          addButtonIcon={addButtonIcon}
        />
      </ListContainer>
    </SelectableListContext.Provider>
  )
})

SelectableList.Item = StyledSelectableListItem
SelectableList.Modal = SelectableModal

export default SelectableList

export const useSelectableListContext = () => {
  const context = useContext(SelectableListContext)
  if (!context) {
    throw new Error('useSelectableListContext must be used within a SelectableList')
  }
  return context
}
