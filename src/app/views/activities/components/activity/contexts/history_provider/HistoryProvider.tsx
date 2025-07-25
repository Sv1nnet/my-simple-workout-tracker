import { GetHistoryListSuccess, HistoryRequestQuery, HistoryResponseData, HistoryResult } from 'store/slices/activity/types'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import dayjs, { Dayjs } from 'dayjs'
import { FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/dist/query'
import { CustomBaseQueryError } from 'store/utils/baseQueryWithReauth'
import { BaseQueryFn } from '@reduxjs/toolkit/dist/query/react'
import { QueryDefinition } from '@reduxjs/toolkit/dist/query/react'
import { LazyQueryTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks'
import { SerializedError } from '@reduxjs/toolkit'
import { useOnPreviousChange } from 'app/hooks'

export type HistoryItem = {
  date: Dayjs
  results: HistoryResult[]
}

export type ExerciseHistory = {
  [key: string]: {
    results: HistoryItem[]
    total: number
    hasLast: boolean
    pagesLoaded: number
  }
}

export type HistoryContextType = {
  history: ExerciseHistory
  isLoading: boolean
  getByExerciseId: (exerciseId: string) => ExerciseHistory[string] | null
  loadHistory: HistoryProviderProps['loadHistory']
}

export type HistoryProviderProps = {
  children: React.ReactNode
  activityId: string | null
  historyData: HistoryResponseData | null
  isLoading: boolean
  loadHistory: LazyQueryTrigger<
  QueryDefinition<
  HistoryRequestQuery,
  BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError | SerializedError | CustomBaseQueryError>,
  string,
  GetHistoryListSuccess,
  'activityApi'
  >
  >
}

const BASE_HISTORY_PERIOD = 30

const initialContextValue: HistoryContextType = {
  history: {},
  isLoading: false,
  getByExerciseId: () => null,
  loadHistory: () => { throw new Error('loadHistory is not initialized') },
}

const HistoryContext = createContext<HistoryContextType>(initialContextValue)

const getPagesLoaded = (loaded: number, byPage: number) => Math.ceil(loaded / byPage)

const getHistory = (historyData: HistoryResponseData) => Object.entries({ ...historyData }).reduce((acc, [ exercise_id, results ]) => {
  acc[exercise_id] = {
    results: results.items.map(item => ({
      date: dayjs(item.date),
      results: item.results,
    })),
    pagesLoaded: getPagesLoaded(results.items.length - 2, BASE_HISTORY_PERIOD),
    hasLast: results.hasLast,
    total: results.total,
  }
  return acc
}, {})

const HistoryProvider = ({ children, historyData, loadHistory, isLoading }: HistoryProviderProps) => {
  const [ history, setHistory ] = useState<ExerciseHistory>(() => historyData ? getHistory(historyData) : {})

  useOnPreviousChange((_, [ nextHistoryData ]) => {
    debugger
    const exerciseIds = Object.keys(nextHistoryData)
    const newHistory = getHistory(nextHistoryData)

    setHistory(exerciseIds.reduce((acc, exerciseId) => {
      const offset = 1
      const newResults = acc[exerciseId]?.results ? [ ...acc[exerciseId].results.slice(0, -offset), ...newHistory[exerciseId].results ] : newHistory[exerciseId].results
      const newExerciseHistory = {
        results: newResults,
        hasLast: newHistory[exerciseId].hasLast,
        pagesLoaded: getPagesLoaded(newResults.length > BASE_HISTORY_PERIOD ? newResults.length - offset : newResults.length, BASE_HISTORY_PERIOD),
        total: newHistory[exerciseId].total,
      }
      acc[exerciseId] = newExerciseHistory
      return acc
    }, { ...history }))
  }, [ historyData ])

  const getByExerciseId = useCallback((exerciseId: string) => history?.[exerciseId] ?? null, [ history ])

  const value = useMemo<HistoryContextType>(() => ({ history, isLoading, getByExerciseId, loadHistory }), [ history, isLoading, getByExerciseId, loadHistory ])

  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>
}

export const useHistoryContext = () => {
  const context = useContext(HistoryContext)

  if (!context) {
    console.warn('useHistoryContext must be used within a HistoryProvider')
    return initialContextValue
  }

  return context
}

export default HistoryProvider