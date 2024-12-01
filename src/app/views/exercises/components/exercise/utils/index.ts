import { useEffect } from 'react'
import { notification } from 'antd'
import { MuscleGroupError } from 'app/store/slices/muscleGroup/types'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'

export type ApiGetMuscleGroupError = {
  data: MuscleGroupError;
  status: number;
}

export const useShowDeleteMuscleGroupError = ([ fetchMuscleGroupsError, createMuscleGroupError, deleteMuscleGroupError ]: ApiGetMuscleGroupError[]) => {
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
