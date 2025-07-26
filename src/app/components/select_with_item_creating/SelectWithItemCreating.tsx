import { Button, Divider, Input, InputRef, Select, SelectProps } from 'antd'
import type { BaseSelectRef } from 'rc-select'
import { ChangeEvent, forwardRef, RefObject, useImperativeHandle, useRef, useState } from 'react'
import { AddItemContainer, OptionContent } from './components'
import { NoDataText } from 'app/components'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { useToggle } from 'app/hooks'
import { nanoid } from '@reduxjs/toolkit'
import { Tag } from 'src/@types'

export type SelectWithItemCreatingProps<T extends Item = Item> = SelectProps<Tag[]> & {
  items: T[]
  isOpen?: boolean
  isSelectOpen?: boolean
  isLoadingItems?: boolean
  isFetchingItems?: boolean
  onDropdownVisibleChange?: (open: boolean) => void
  onChange?: SelectProps<Tag[]>['onChange']
  onAddItem?: (item: { label: string, id: string }) => Promise<any>
  onDeleteItem?: (id: string) => Promise<any>
}

export type SelectWithItemCreatingRef = {
  clearValue: () => void
  close: () => void
  open: () => void
  isOpen: boolean
}

export type Item = {
  label: string
  id: string
}

const { Option } = Select

const SelectWithItemCreating = forwardRef(function SelectWithItemCreating<T extends Item = Item>({
  isLoadingItems,
  isFetchingItems,
  onChange,
  onAddItem,
  onDeleteItem,
  onDropdownVisibleChange,
  items,
  isOpen: isOpenProp,
  ...props
}: SelectWithItemCreatingProps<T>, selectRef: RefObject<SelectWithItemCreatingRef>) {
  const { intl } = useIntlContext()
  
  const $select = useRef<BaseSelectRef>()
  const $addTagInput = useRef<InputRef>(null)

  const {
    state: isSelectOpen,
    setFalse: closeSelect,
    setTrue: openSelect,
    setState: setIsSelectOpen,
  } = useToggle(false)

  const [ addTagInputValue, setAddTagInputValue ] = useState('')

  const handleAddTagInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAddTagInputValue(e.target.value)
  }

  const handleAddItem = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()

    const id = nanoid()
    const newItem = { label: addTagInputValue, id }

    await onAddItem?.(newItem)

    setAddTagInputValue('')

    $addTagInput.current?.focus()
  }

  const handleDeleteItem = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    e.preventDefault()

    const id = e.currentTarget.dataset.id

    if (id) {
      await onDeleteItem?.(id)
    }
  }

  const handleDropdownVisibleChange = (isVisible: boolean) => {
    setIsSelectOpen(isVisible)

    if (!isVisible && !isOpenProp) setAddTagInputValue('')

    onDropdownVisibleChange?.(isVisible)
  }

  useImperativeHandle(selectRef, () => ({
    clearValue: () => setAddTagInputValue(''),
    close: closeSelect,
    open: openSelect,
    isOpen: isSelectOpen,
    $select,
  }))

  return (
    <Select<Tag[]>
      ref={$select}
      open={isOpenProp ?? isSelectOpen}
      loading={isLoadingItems || isFetchingItems}
      onDropdownVisibleChange={handleDropdownVisibleChange}
      placeholder={intl.rest.muscle_group.select_muscle_groups}
      mode="multiple"
      dropdownMatchSelectWidth
      size="middle"
      optionLabelProp="label"
      optionFilterProp="label"
      notFoundContent={<NoDataText>{intl.common.empty_list}</NoDataText>}
      menuItemSelectedIcon={null}
      onFocus={openSelect}
      onChange={onChange}
      dropdownRender={menu => (
        <>
          {menu}
          <Divider style={{ margin: '8px 0' }} />
          <AddItemContainer>
            <Input
              ref={$addTagInput}
              value={addTagInputValue}
              onChange={handleAddTagInputChange}
            />
            <Button disabled={!addTagInputValue} type="text" icon={<PlusOutlined />} onClick={handleAddItem}>
              {intl.common.add}
            </Button>
            <Button type='primary' onClick={() => handleDropdownVisibleChange(false)}>
              {intl.common.ok}
            </Button>
          </AddItemContainer>
        </>
      )}
      {...props}
    >
      {items?.map(item => (
        <Option
          label={item.label}
          value={item.id}
          key={item.id}
        >
          <OptionContent>
            <span>{item.label}</span>
            <Button data-id={item.id} danger size='small' icon={<DeleteOutlined />} onClick={handleDeleteItem} />
          </OptionContent>
        </Option>
      ))}
    </Select>
  )
}) as <T extends Item>(props: SelectWithItemCreatingProps<T> & { ref?: RefObject<SelectWithItemCreatingRef> }) => JSX.Element

export default SelectWithItemCreating