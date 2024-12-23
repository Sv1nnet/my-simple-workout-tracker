import { FormInstance } from 'antd'
import { ActivityForm } from 'app/store/slices/activity/types'
import { createContext, useContext, useMemo } from 'react'

type ActivityContextType = {
  form: FormInstance<ActivityForm> | null
  selectedWorkout: string | null
  activityId: string | null
}

const initialContextValue: ActivityContextType = {
  form: null,
  selectedWorkout: null,
  activityId: null,
}

const ActivityContext = createContext<ActivityContextType>(initialContextValue)

export type ActivityProviderProps = {
  children: React.ReactNode
  form: FormInstance<ActivityForm>
  selectedWorkout: string | null
  activityId: string
}

const ActivityProvider = ({ children, form, selectedWorkout, activityId }: ActivityProviderProps) => {
  const value = useMemo(() => ({ selectedWorkout, form, activityId }), [ selectedWorkout, form, activityId ])

  return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>
}

export const useActivityContext = () => {
  const context = useContext(ActivityContext)

  if (!context) {
    console.warn('useActivityContext must be used within an ActivityProvider')
    return initialContextValue
  }

  return context
}

export default ActivityProvider
