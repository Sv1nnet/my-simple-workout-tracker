import { ChangeEvent, ChangeEventHandler, useMemo, useRef, useState } from 'react'
import { CloseOutlined, SearchOutlined } from '@ant-design/icons'
import { Input } from 'antd'
import AddButton from '../add_button/AddButton'
import { AddButtonText, Container, StyledInput, StyledInputGroup, StyledSearchButton } from './styled'
import { useDebouncedCallback } from '@/src/app/hooks'
import isFunc from '@/src/app/utils/isFunc'

export type OnChangeHandler = (value: string, e: ChangeEvent<HTMLInputElement>) => void


export type UseSearchPanelUtils = <T = any>(
  initialList: T[],
  {
    filterFn,
    onChange,
  }: {
    filterFn?: (searchValue: string) => (item: T, index: number, array: T[]) => boolean
    onChange?: (...args: Parameters<OnChangeHandler>) => unknown
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
}

export const useSearchPanelUtils: UseSearchPanelUtils = (
  initialList,
  {
    filterFn,
    onChange,
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

    if (isFunc(onChange)) onChange(_value, e)
  }, onChangeDelay)

  return { searchValue, filteredList, onSearchInputChange }
}

const SearchPanel = ({ loading, href, addButtonText, onChange }) => {
  const [ isOpen, setIsOpen ] = useState(false)
  const $input = useRef<Input>(null)

  const handleChange: ChangeEventHandler<HTMLInputElement> = e => onChange(e.target.value, e)

  const Prefix = useMemo(() => {
    const Icon = isOpen ? <CloseOutlined width="50px" height="40px" style={{ minWidth: 50 }} /> : <SearchOutlined width="50px" height="40px" style={{ minWidth: 50 }} />
    const handleClick = () => {
      if (!isOpen) {
        $input.current?.focus()
      } else {
        onChange('')
        $input.current.setValue('')
      }

      setIsOpen(!isOpen)
    }
  
    return <StyledSearchButton onClick={handleClick} icon={Icon} />
  }, [ isOpen ])

  return (
    <Container>
      <StyledInputGroup $collapsed={!isOpen}>
        {Prefix}
        <StyledInput ref={$input} size='large' $collapsed={!isOpen} onChange={handleChange} />
      </StyledInputGroup>
      <AddButton
        loading={loading}
        buttonProps={{ className: isOpen ? 'minified' : '', style: { marginLeft: 5 } }}
        href={href}
        text={<AddButtonText $isVisible={!isOpen}>{addButtonText}</AddButtonText>}
      />
    </Container>
  )
}

export default SearchPanel
