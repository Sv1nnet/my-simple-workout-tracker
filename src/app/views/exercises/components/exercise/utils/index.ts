import { useEffect } from 'react'
import { notification } from 'antd'
import { MuscleGroupError } from 'app/store/slices/muscleGroup/types'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { ExerciseForm } from '@/src/app/store/slices/exercise/types'
import { Dayjs } from 'dayjs'

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


export type InitialValues = {
  title: string;
  each_side: boolean;
  type?: 'repeats' | 'time' | 'duration' | 'distance';
  time?: number | Dayjs;
  repeats?: number;
  weight?: number;
  description?: string;
  image?: {
    uid: string,
    url: string,
    name: string,
  };
}

export interface IExercise {
  id?: string;
  isEdit?: boolean;
  isFetching?: boolean;
  initialValues?: ExerciseForm;
  isError: boolean;
  error?: string;
  errorCode?: number;
  errorAppCode?: number;
  deleteExercise?: Function;
  onSubmit: Function;
}

export const clearValues = (values: ExerciseForm) => ({
  ...values,
  time: values.type === 'weight' || values.type === 'repeats' || values.type === 'distance' ? values.time : null,
  weight: values.type !== 'weight' ? values.weight : null,
  repeats: values.type === 'weight' || values.type === 'time' || values.type === 'duration' ? values.repeats : null,
})

export type PreviewReducerState = { visible: boolean, title: string, url: string }

export const previewReducer = (state: PreviewReducerState, { type, payload }: { type: string, payload: Partial<PreviewReducerState> }) => {
  switch (type) {
    case 'open':
      return {
        ...state,
        visible: true,
        title: payload.title,
        url: payload.url,
      }
    case 'close': 
      return {
        ...state,
        visible: false,
        title: '',
        url: '',
      }
    default:
      return state
  }
}
