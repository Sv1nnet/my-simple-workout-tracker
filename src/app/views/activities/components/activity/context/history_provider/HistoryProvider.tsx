import { HistoryResponseData, HistoryResult } from 'store/slices/activity/types'
import { createContext, useCallback, useContext, useMemo } from 'react'
import dayjs, { Dayjs } from 'dayjs'

export type HistoryItem = {
  date: Dayjs
  results: HistoryResult[]
}

export type ExerciseHistory = {
  [key: string]: {
    results: HistoryItem[]
    total: number
  }
}

export type HistoryContextType = {
  history: ExerciseHistory
  isLoading: boolean
  getByExerciseId: (exerciseId: string) => ExerciseHistory[string] | null
}

export type HistoryProviderProps = {
  children: React.ReactNode
  historyData: HistoryResponseData | null
  isLoading: boolean
}

const initialContextValue: HistoryContextType = { history: {}, isLoading: false, getByExerciseId: () => null }

const HistoryContext = createContext<HistoryContextType>(initialContextValue)

const HistoryProvider = ({ children, historyData, isLoading }: HistoryProviderProps) => {
  const history = useMemo<ExerciseHistory>(
    () => historyData
      ? Object.entries({ ...historyData }).reduce((acc, [ exercise_id, results ]) => {
        acc[exercise_id] = {
          results: results.items.map(item => ({
            date: dayjs(item.date),
            results: item.results,
          })),
          total: results.total,
        }
        return acc
      }, {})
      : {},
    [ historyData ],
  )

  const getByExerciseId = useCallback((exerciseId: string) => history?.[exerciseId] ?? null, [ history ])

  const value = useMemo<HistoryContextType>(() => ({ history, isLoading, getByExerciseId }), [ history, isLoading, getByExerciseId ])

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