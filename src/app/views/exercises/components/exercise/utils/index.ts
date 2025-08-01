import { useEffect, useState } from 'react'
import { FormInstance, notification } from 'antd'
import { MuscleGroupError } from 'app/store/slices/muscleGroup/types'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { ExerciseForm, Image } from 'app/store/slices/exercise/types'
import { Dayjs } from 'dayjs'
import { API_STATUS } from 'app/constants/api_statuses'
import routes from 'app/constants/end_points'
import { useMounted, useOnPreviousChange } from 'app/hooks'

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

const getMuscleGroupFromList = (currentMuscleGroups: (string | { label: string; value: string })[], muscleGroupsItems: {
  label: string;
  id: string;
  value: string;
}[]) => currentMuscleGroups.map((muscleGroupId) => {
  const muscleGroupFromList = muscleGroupsItems
    .find(muscleGroup => typeof muscleGroupId === 'string'
      ? muscleGroup.id === muscleGroupId
      : muscleGroup.id === muscleGroupId?.value)

  return muscleGroupFromList ? {
    label: muscleGroupFromList.label,
    value: muscleGroupFromList.id,
  } : null
}).filter(Boolean) || []

export const useInitialValues = (
  _initialValues: IExercise['initialValues'],
  muscleGroupsItems: {
    label: string;
    id: string;
    value: string;
  }[],
  muscleGroupListStatus: typeof API_STATUS[keyof typeof API_STATUS],
  isFetching: boolean,
  isError: boolean,
  form: FormInstance<ExerciseForm>,
) => {
  const { isMounted, useHandleMounted } = useMounted()

  const stateSetter = () => {
    const {
      is_in_workout: _is_in_workout,
      ...exercise
    } = { ..._initialValues }

    if (exercise.image) {
      const image = exercise.image as Image
      exercise.image = {
        ...image,
        url: image.url
          ? image.url.startsWith('data:image/')
            ? image.url
            : `${routes.base}${image.url}`
          : '',
      }
      exercise.image = [ image ]
    }

    if (muscleGroupListStatus === API_STATUS.LOADED) {
      exercise.muscle_groups = getMuscleGroupFromList(exercise.muscle_groups || [], muscleGroupsItems)
    }

    return exercise
  }

  const [ initialValues, setInitialValues ] = useState(stateSetter)

  useOnPreviousChange(() => {
    setInitialValues(stateSetter)
  }, [ _initialValues ])

  useEffect(() => {
    if (isMounted() && !isFetching && !isError) {
      form.setFieldsValue(initialValues)
    }
  }, [ initialValues, isFetching ])

  useEffect(() => {
    if (isMounted() && muscleGroupListStatus === API_STATUS.LOADED) {
      const currentMuscleGroups = form.getFieldValue('muscle_groups')
      form.setFieldsValue({
        muscle_groups: getMuscleGroupFromList(currentMuscleGroups || [], muscleGroupsItems),
      })
    }
  }, [ muscleGroupsItems, muscleGroupListStatus ])

  useHandleMounted()

  return { initialValues, setInitialValues }
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
  initialValues?: ExerciseForm & { is_in_activity?: boolean };
  isError: boolean;
  error?: string;
  errorCode?: number;
  errorAppCode?: number;
  deleteExercise?: Function;
  onSubmit: Function;
}

export const clearValues = (values: ExerciseForm) => ({
  ...values,
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
