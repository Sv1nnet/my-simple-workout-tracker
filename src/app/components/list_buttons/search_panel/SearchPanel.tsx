import { ChangeEventHandler, useEffect, useMemo, useRef, useState } from 'react'
import { CloseOutlined, LoadingOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import AddButton from '../add_button/AddButton'
import {
  AddButtonText,
  ButtonsContainer,
  Container,
  ReloadButton,
  SelectContainer,
  StyledCollapse,
  StyledInput,
  StyledInputGroup,
  StyledSearchButton,
} from './components'
import { useToggle } from 'app/hooks'
import { Collapse, notification, Select, SelectProps, Spin } from 'antd'
import { Tag } from 'src/@types'
import { muscleGroupApi } from 'app/store/slices/muscleGroup/api'
import { OnChangeHandler } from './utils'
import { NoDataText } from 'app/components'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'

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
  const [ searchValue, setSearchValue ] = useState('')
  const [ tags, setTags ] = useState<Tag[]>([])

  const $input = useRef(null)
  const $select = useRef(null)

  const { data: muscleGroups, isLoading: isLoadingMuscleGroups, isFetching: isFetchingMuscleGroups, error: fetchMuscleGroupsError } = muscleGroupApi.useListQuery({ lang: 'ru' })
  const muscleGroupsItems = useMemo(() => muscleGroups?.data?.map(muscleGroup => ({ label: muscleGroup.title, id: muscleGroup.id })), [ muscleGroups?.data ])

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setSearchValue(e.target.value)
    onChange({
      searchValue: e.target.value,
      tags,
    }, e)
  }

  const handleSelectTagsChange: SelectProps<Tag[]>['onChange'] = (value, e) => {
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
      } else if ($input.current?.input?.value || tags.length) {
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

      if (isOpen) $select.current?.close()
    }
  
    return <StyledSearchButton onClick={handleClick} icon={Icon} />
  }, [ isOpen, tags ])

  useEffect(() => {
    if (fetchMuscleGroupsError) {
      notification.error({
        message: intl.common?.error,
        description: intl.rest?.muscle_group?.error?.loading,
      })
    }
  }, [ fetchMuscleGroupsError ])

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
            <Select
              value={tags}
              loading={isLoadingMuscleGroups || isFetchingMuscleGroups}
              placeholder={intl.rest.muscle_group.select_muscle_groups}
              mode="tags"
              labelInValue
              dropdownMatchSelectWidth
              size="middle"
              optionLabelProp="label"
              optionFilterProp="label"
              notFoundContent={<NoDataText>{intl.common.empty_list}</NoDataText>}
              menuItemSelectedIcon={null}
              onChange={handleSelectTagsChange}
            >
              {muscleGroupsItems?.map(item => (
                <Select.Option key={item.id} label={item.label} value={item.id}>{item.label}</Select.Option>
              ))}
            </Select>
          </SelectContainer>
        </Collapse.Panel>
      </StyledCollapse>
    </Container>
  )
}

export default SearchPanel
