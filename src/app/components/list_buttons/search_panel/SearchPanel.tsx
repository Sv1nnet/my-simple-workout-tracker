import { ChangeEvent, ChangeEventHandler, useMemo, useRef, useState } from 'react'
import { CloseOutlined, DeleteOutlined, LoadingOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import AddButton from '../add_button/AddButton'
import {
  AddButtonText,
  AddItemContainer,
  ButtonsContainer,
  Container,
  NoDataText,
  OptionContent,
  ReloadButton,
  SelectContainer,
  StyledCollapse,
  StyledInput,
  StyledInputGroup,
  StyledSearchButton,
} from './components'
import { useToggle } from 'app/hooks'
import { Button, Collapse, Divider, Input, InputRef, Select, Spin } from 'antd'
import { muscleGroupApi } from 'app/store/slices/muscleGroup/api'
import { nanoid } from '@reduxjs/toolkit'
import { DefaultOptionType } from 'antd/lib/select'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { ApiGetMuscleGroupError, OnChangeHandler, Tag, useShowError } from './utils'

const { Option } = Select

export type SearchPanelProps = {
  href: string,
  addButtonText: string,
  onChange: (...args: Parameters<OnChangeHandler>) => unknown,
  refetch: () => unknown,
  loading: boolean,
}

const SearchPanel = ({ href, addButtonText, onChange, refetch, loading }: SearchPanelProps) => {
  const { intl } = useIntlContext()

  const { state: isOpen, setState: setIsOpen } = useToggle(false)
  const { state: isMuscleGroupsSelectOpen, setFalse: closeMuscleGroupsSelect, setTrue: openMuscleGroupsSelect, setState: setIsMuscleGroupsSelectOpen } = useToggle(false)
  const [ searchValue, setSearchValue ] = useState('')
  const [ addTagInputValue, setAddTagInputValue ] = useState('')
  const [ tags, setTags ] = useState<Tag[]>([])

  const $input = useRef(null)
  const $select = useRef(null)
  const $addTagInput = useRef<InputRef>(null)

  const { data: muscleGroups, isLoading: isLoadingMuscleGroups, isFetching: isFetchingMuscleGroups, error: fetchMuscleGroupsError } = muscleGroupApi.useListQuery({ lang: 'ru' })
  const [ createMuscleGroup, { error: createMuscleGroupError } ] = muscleGroupApi.useCreateMutation()
  const [ deleteMuscleGroup, { error: deleteMuscleGroupError } ] = muscleGroupApi.useDeleteMutation()

  const handleAddTagInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAddTagInputValue(e.target.value)
  }

  const handleDropdownVisibleChange = (isVisible: boolean) => {
    setIsMuscleGroupsSelectOpen(isVisible)

    if (!isVisible) setAddTagInputValue('')
  }

  const addItem = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const id = nanoid()
    const newMuscleGroup = { title: addTagInputValue, id }

    try {
      await createMuscleGroup(newMuscleGroup).unwrap()
    } catch (createError) {
      console.error(createError)
    }

    setAddTagInputValue('')
  }

  const handleDeleteItem = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    e.preventDefault()

    const id = e.currentTarget.dataset.id

    try {
      if (id) {
        await deleteMuscleGroup({ id }).unwrap()
      }
    } catch (deleteError) {
      console.error(deleteError)
    }
  }

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setSearchValue(e.target.value)
    onChange({
      searchValue: e.target.value,
      tags,
    }, e)
  }

  const handleSelectTagsChange = (value: Tag[], e: DefaultOptionType | DefaultOptionType[]) => {
    setTags(value)
    onChange({
      searchValue,
      tags: value,
    }, Array.isArray(e) ? e : [ e ])
  }

  const Prefix = useMemo(() => {
    const Icon = isOpen ? <CloseOutlined width="50px" height="40px" style={{ minWidth: 50 }} /> : <SearchOutlined width="50px" height="40px" style={{ minWidth: 50 }} />
    const handleClick = () => {
      if (!isOpen) {
        $input.current?.input.focus()
      } else if ($input.current?.input?.value) {
        const newValue = ''
        const newTags = []
        
        setSearchValue(newValue)
        setTags(newTags)
        onChange({
          searchValue: newValue,
          tags: newTags,
        }, null)
        $input.current.input.value = newValue
      }

      setIsOpen(!isOpen)

      if (isOpen) closeMuscleGroupsSelect()
    }
  
    return <StyledSearchButton onClick={handleClick} icon={Icon} />
  }, [ isOpen ])

  useShowError([ fetchMuscleGroupsError, createMuscleGroupError, deleteMuscleGroupError ] as ApiGetMuscleGroupError[])

  return (
    <Container>
      <ButtonsContainer>
        <StyledInputGroup $collapsed={!isOpen}>
          {Prefix}
          <StyledInput ref={$input} size='large' $collapsed={!isOpen} value={searchValue} onChange={handleChange} />
        </StyledInputGroup>
        <AddButton
          buttonProps={{ htmlType: 'button', className: isOpen ? 'minified' : '', style: { marginLeft: 5 } }}
          href={href}
          text={<AddButtonText $isVisible={!isOpen}>{addButtonText}</AddButtonText>}
        />
        {loading
          ? (
            <ReloadButton>
              <Spin size="small" indicator={<LoadingOutlined />} />
            </ReloadButton>
          )
          : (
            <ReloadButton onClick={refetch}>
              <ReloadOutlined />
            </ReloadButton>
          )}
      </ButtonsContainer>
      <StyledCollapse bordered={false} ghost activeKey={isOpen ? '1' : null} destroyInactivePanel>
        <Collapse.Panel header='' key='1' showArrow={false}>
          <SelectContainer $collapsed={!isOpen}>
            <Select<Tag[]>
              ref={$select}
              open={isMuscleGroupsSelectOpen}
              loading={isLoadingMuscleGroups || isFetchingMuscleGroups}
              onDropdownVisibleChange={handleDropdownVisibleChange}
              placeholder={intl.rest.muscle_group.select_muscle_groups}
              mode='multiple'
              labelInValue
              dropdownMatchSelectWidth
              size='middle'
              optionLabelProp="label"
              notFoundContent={<NoDataText>{intl.common.empty_list}</NoDataText>}
              menuItemSelectedIcon={null}
              onFocus={openMuscleGroupsSelect}
              onChange={handleSelectTagsChange}
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
                    <Button disabled={!addTagInputValue} type="text" icon={<PlusOutlined />} onClick={addItem}>
                      {intl.common.add}
                    </Button>
                    <Button type='primary' onClick={() => handleDropdownVisibleChange(false)}>
                      {intl.common.ok}
                    </Button>
                  </AddItemContainer>
                </>
              )}
            >
              {muscleGroups?.data?.map(muscleGroup => (
                <Option
                  label={muscleGroup.title}
                  value={muscleGroup.id}
                  key={muscleGroup.id}
                >
                  <OptionContent>
                    {muscleGroup.title}
                    <Button data-id={muscleGroup.id} danger size='small' icon={<DeleteOutlined />} onClick={handleDeleteItem} />
                  </OptionContent>
                </Option>
              ))}
            </Select>
          </SelectContainer>
        </Collapse.Panel>
      </StyledCollapse>
    </Container>
  )
}

export default SearchPanel
