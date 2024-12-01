import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { useDebouncedCallback } from 'app/hooks'
import { notification } from 'antd'
import { DefaultOptionType } from 'antd/lib/select'
import { MuscleGroupError } from 'app/store/slices/muscleGroup/types'
import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { Tag } from 'src/@types'

export type ApiGetMuscleGroupError = {
  data: MuscleGroupError;
  status: number;
}

export type Values = { searchValue: string, tags: Tag[] }

export type OnChangeHandler = (values: Values, e: ChangeEvent<HTMLInputElement> | DefaultOptionType[] | null) => void

export type UseSearchPanelUtils = <T = any>(
  initialList: T[],
  {
    filterFn,
    onChange,
  }: {
    filterFn?: ({ searchValue, tags }: Values) => (item: T, index: number, array: T[]) => boolean
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
  const [ tags, setTags ] = useState<Tag[]>([])
  const filteredList = useMemo(
    () => filterFn ? initialList.filter(filterFn({ searchValue, tags })) : initialList,
    [ searchValue, tags, initialList, filterFn ],
  )

  const onSearchInputChange = useDebouncedCallback<OnChangeHandler>(async (value, e) => {
    let _value = value.searchValue
    
    if (shouldTrim) {
      _value = _value.trim()
    }

    if (shouldLowerCase) {
      _value = _value.toLowerCase()
    }

    if (shouldUpperCase) {
      _value = _value.toUpperCase()
    }

    if (transformValueFn) {
      _value = transformValueFn({ searchValue: _value, tags: value.tags }, e)
    }
    
    setSearchValue(_value)
    setTags(value.tags)

    onChange?.({ searchValue: _value, tags: value.tags }, e)
  }, onChangeDelay)

  const onRefetchClick = refetch ? () => refetch() : undefined

  return { searchValue, filteredList, onSearchInputChange, onRefetchClick }
}


export const useShowError = ([ fetchMuscleGroupsError, createMuscleGroupError, deleteMuscleGroupError ]: ApiGetMuscleGroupError[]) => {
  const { lang, intl } = useIntlContext()

  useEffect(() => {
    if (fetchMuscleGroupsError) {
      notification.error({
        message: intl.common.error,
        description: (fetchMuscleGroupsError as ApiGetMuscleGroupError)?.data?.error?.message?.text?.[lang || 'eng'],
      })
    }
  }, [ fetchMuscleGroupsError ])

  useEffect(() => {
    if (createMuscleGroupError) {
      notification.error({
        message: intl.common.error,
        description: (createMuscleGroupError as ApiGetMuscleGroupError)?.data?.error?.message?.text?.[lang || 'eng'],
      })
    }
  }, [ createMuscleGroupError ])

  useEffect(() => {
    if (deleteMuscleGroupError) {
      notification.error({
        message: intl.common.error,
        description: (deleteMuscleGroupError as ApiGetMuscleGroupError)?.data?.error?.message?.text?.[lang || 'eng'],
      })
    }
  }, [ deleteMuscleGroupError ])
}
