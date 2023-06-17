import { ChangeEvent, ChangeEventHandler, useMemo, useRef, useState } from 'react'
import { CloseOutlined, LoadingOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import AddButton from '../add_button/AddButton'
import { AddButtonText, Container, ReloadButton, StyledInput, StyledInputGroup, StyledSearchButton } from './styled'
import { useDebouncedCallback } from 'app/hooks'
import { Spin } from 'antd'

export type OnChangeHandler = (value: string, e: ChangeEvent<HTMLInputElement>) => void

export type UseSearchPanelUtils = <T = any>(
  initialList: T[],
  {
    filterFn,
    onChange,
  }: {
    filterFn?: (searchValue: string) => (item: T, index: number, array: T[]) => boolean
    onChange?: (...args: Parameters<OnChangeHandler>) => unknown
    refetch?: (...args: any[]) => any
  },
  { shouldLowerCase,
    shouldUpperCase,
    shouldTrim,
    transformValueFn,
  }?: {
    initialSearchValue?: string,
    shouldLowerCase?: boolean;
    shouldUpperCase?: boolean;
    shouldTrim?: boolean;
    transformValueFn?: (...args: Parameters<OnChangeHandler>) => string;
    onChangeDelay?: number;
  }
) => {
  searchValue: string,
  filteredList: T[],
  onSearchInputChange: OnChangeHandler,
  onRefetchClick: () => void
}

export const useSearchPanelUtils: UseSearchPanelUtils = (
  initialList,
  {
    filterFn,
    onChange,
    refetch,
  },
  {
    initialSearchValue = '',
    shouldLowerCase,
    shouldUpperCase,
    shouldTrim,
    transformValueFn,
    onChangeDelay = 200,
  },
) => {
  const [ searchValue, setSearchValue ] = useState(initialSearchValue)
  const filteredList = useMemo(
    () => filterFn ? initialList.filter(filterFn(searchValue)) : initialList,
    [ searchValue, initialList, filterFn ],
  )

  const onSearchInputChange = useDebouncedCallback<OnChangeHandler>(async (value, e) => {
    let _value = value
    
    if (shouldTrim) {
      _value = value.trim()
    }

    if (shouldLowerCase) {
      _value = _value.toLowerCase()
    }

    if (shouldUpperCase) {
      _value = _value.toUpperCase()
    }

    if (transformValueFn) {
      _value = transformValueFn(_value, e)
    }
    
    setSearchValue(_value)

    onChange?.(_value, e)
  }, onChangeDelay)

  const onRefetchClick = refetch ? () => refetch() : undefined

  return { searchValue, filteredList, onSearchInputChange, onRefetchClick }
}

const SearchPanel = ({ href, addButtonText, onChange, refetch, loading }) => {
  const [ isOpen, setIsOpen ] = useState(false)
  const [ searchValue, setSearchValue ] = useState('')
  const $input = useRef(null)

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setSearchValue(e.target.value)
    onChange(e.target.value, e)
  }

  const Prefix = useMemo(() => {
    const Icon = isOpen ? <CloseOutlined width="50px" height="40px" style={{ minWidth: 50 }} /> : <SearchOutlined width="50px" height="40px" style={{ minWidth: 50 }} />
    const handleClick = () => {
      if (!isOpen) {
        $input.current?.input.focus()
      } else if ($input.current?.input?.value) {
        const newValue = ''

        onChange(newValue)
        setSearchValue(newValue)
        $input.current.input.value = newValue
      }

      setIsOpen(!isOpen)
    }
  
    return <StyledSearchButton onClick={handleClick} icon={Icon} />
  }, [ isOpen ])

  return (
    <Container>
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
      
    </Container>
  )
}

export default SearchPanel
