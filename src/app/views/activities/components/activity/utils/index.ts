import { dayjsToSeconds, isExerciseTimeType, secondsToDayjs, timeArrayToMilliseconds } from 'app/utils/time'
import { WorkoutForm, WorkoutListItem } from 'app/store/slices/workout/types'
import dayjs, { Dayjs, isDayjs } from 'dayjs'
import { InitialValues } from '../types'
import React, { MutableRefObject, useEffect, useLayoutEffect } from 'react'
import { FormInstance, Modal } from 'antd'
import { ActivityForm } from 'app/store/slices/activity/types'
import { NavigateFunction, useNavigate } from 'react-router'
import { CustomBaseQueryError } from 'app/store/utils/baseQueryWithReauth'
import { Lang } from 'app/store/slices/config/types'
import { API_STATUS, ApiStatus } from 'app/constants/api_statuses'
import { WORKOUT_TAG_TYPES, workoutApi } from 'app/store/slices/workout/api'
import { updateList } from 'app/store/slices/workout'
import { useAppLoaderContext } from 'app/contexts/loader/AppLoaderContextProvider'
import { SetValue, useAppDispatch } from 'app/hooks'

export const getComparator = (type: string) => type === 'time' 
  ? {
    pos: (curr, next) => curr < next,
    neg: (curr, next) => curr > next,
  }
  : {
    pos: (curr, next) => curr > next,
    neg: (curr, next) => curr < next,
  }

export const getResultsFromWorkoutList = (workoutList: WorkoutListItem[], workoutId: Pick<WorkoutForm, 'id'> | string) => workoutList
  .find(wk => wk.id === workoutId)
// TODO: on the server - exercise -> details
  ?.exercises
  ?.map(({ rounds, _id, exercise }) => ({
    _id,
    hours: exercise.hours,
    original_id: exercise.id,
    id_in_workout: _id,
    type: exercise.type,
    rounds: Array.from({ length: rounds }, () => exercise.each_side ? { left: null, right: null } : null),
    note: undefined,
  })) || []

const defaultInitialValues = {
  _id: undefined,
  workout_id: '',
  duration: 0,
  date: undefined,
  results: [],
  description: '',
} as InitialValues<Dayjs>

export const getInitialActivityValues = ({
  initialValues,
  workoutList,
  cachedFormValues,
  selectedWorkout,
  initFromCacheRef,
  form,
  handleRestoreFromCacheError,
  isEdit,
}: {
  initialValues: InitialValues<string>,
  workoutList: WorkoutListItem[],
  cachedFormValues: InitialValues | null,
  selectedWorkout: Pick<WorkoutForm, 'id'>,
  initFromCacheRef: MutableRefObject<boolean>,
  form: FormInstance<ActivityForm>,
  handleRestoreFromCacheError: VoidFunction,
  isEdit?: boolean,
}): InitialValues<Dayjs> => {
  if (isEdit && initialValues === null) {
    return { ...defaultInitialValues }
  }

  let newInitialValues: InitialValues<Dayjs>
  try {
    if (!isEdit && cachedFormValues && selectedWorkout && initFromCacheRef.current && workoutList.length) {
      const workout = workoutList
        .find(wk => wk.id === cachedFormValues.workout_id)

      newInitialValues = {
        duration: 0,
        ...cachedFormValues,
        workout_id: selectedWorkout,
        date: dayjs(cachedFormValues.date),
        results: cachedFormValues.results
          ? cachedFormValues.results.map((results, i) => {
            const { _id, exercise } = workout.exercises[i]
            return isExerciseTimeType(exercise.type)
              ? {
                _id,
                hours: exercise.hours,
                original_id: exercise.id,
                id_in_workout: _id,
                type: exercise.type,
                ...results,
                rounds: results.rounds.map((round: string | { right: string, left: string }) => {
                  if (round === null) return ''

                  return (typeof round === 'object')
                    ? { right: round.right !== null ? dayjs(round.right) : '', left: round.left !== null ? dayjs(round.left) : '' }
                    : dayjs(round as string)
                }),
              }
              : {
                ...results,
                _id,
                hours: exercise.hours,
                original_id: exercise.id,
                id_in_workout: _id,
                type: exercise.type,
                rounds: results.rounds.map((round: string | { right: string, left: string }) => {
                  if (round === null) return ''

                  return (typeof round === 'object')
                    ? { right: round.right !== null ? +round.right : '', left: round.left !== null ? +round.left : '' }
                    : +round
                }),
              }
          })
          : getResultsFromWorkoutList(workoutList, cachedFormValues.workout_id),
      }
    } else if (!isEdit) {
      newInitialValues = {
        id: initialValues._id,
        duration: 0,
        date: (form.getFieldValue('date') as Dayjs) || dayjs(),
        workout_id: selectedWorkout,
        results: getResultsFromWorkoutList(workoutList, form.getFieldValue('workout_id')),
        description: '',
      }
    } else {
      newInitialValues = {
        duration: 0,
        ...initialValues,
        date: dayjs(initialValues.date),
        results: initialValues.results?.map(results => isExerciseTimeType(results.type)
          ? {
            ...results,
            rounds: results.rounds.map((round: number | { right: number, left: number }) => (round !== null && typeof round === 'object')
              ? { right: secondsToDayjs(round.right), left: secondsToDayjs(round.left) }
              : secondsToDayjs(round as number)),
          }
          : results),
      }
    }

    return newInitialValues
  } catch (e) {
    handleRestoreFromCacheError()
    return { ...defaultInitialValues }
  }
}

export const getActivityValuesToSubmit = ({ ...values }, initialValues, workoutList, durationTimerRef) => {
  values.id = initialValues.id
  values.duration = timeArrayToMilliseconds(durationTimerRef.current.valueRef.current)
  values.date = values.date.toJSON()
  values.results = values.results.reduce((acc, { id, rounds, note }, i) => {
    const exercise = workoutList.find(workout => workout.id === values.workout_id).exercises[i]
    const { exercise: details } = exercise

    acc.push({
      original_id: id || exercise.id,
      id_in_workout: exercise._id,
      type: details.type,
      rounds: isExerciseTimeType(details.type)
        ? rounds.map((round) => {
          if (round === null || round === '') return 0
          return isDayjs(round)
            ? dayjsToSeconds(round)
            : {
              right: round.right === null || round.right === '' ? 0 : dayjsToSeconds(round.right),
              left: round.left === null || round.left === '' ? 0 : dayjsToSeconds(round.left),
            }
        })
        : rounds.map((round) => {
          if (round === null || round === '') return 0
          return typeof round === 'number' || typeof round === 'string'
            ? +round
            : {
              right: round.right === null || round.right === '' ? 0 : +round.right,
              left: round.left === null || round.left === '' ? 0 : +round.left,
            }
        }),
      note,
    })
    return acc
  }, [])

  return values
}

export const showActivityErrors = (
  restoreError: { error?: string, isError?: boolean },
  historyError: { error?: string, isError?: boolean },
  errorCode: number,
  errorModalsRef: React.MutableRefObject<{
    restoreActivity: {
      destroy: () => void;
      update: (configUpdate: object) => void;
    };
    history: {
      destroy: () => void;
      update: (configUpdate: object) => void;
    };
  }>,
  dict: {
    title: { error: string },
    default_content: { error: string },
    ok_text: string,
  },
  navigate: NavigateFunction,
) => {
  const { error, isError } = restoreError
  const { error: historyErrorText, isError: isHistoryError } = historyError

  if (error || isError) {
    if (errorModalsRef.current.restoreActivity) {
      errorModalsRef.current.restoreActivity.destroy()
      errorModalsRef.current.restoreActivity = null
    }

    errorModalsRef.current.restoreActivity = Modal.error({
      title: dict.title.error,
      content: error || dict.default_content.error,
      okText: dict.ok_text,
      onOk() {
        if (errorCode === 404) navigate('/activities')
      },
    })

    return () => {
      errorModalsRef.current.restoreActivity?.destroy()
      errorModalsRef.current.restoreActivity = null
    }
  } else if (historyErrorText || isHistoryError) {
    if (errorModalsRef.current.history) {
      errorModalsRef.current.history.destroy()
      errorModalsRef.current.history = null
    }

    errorModalsRef.current.history = Modal.error({
      title: dict.title.error,
      content: historyErrorText || dict.default_content.error,
      okText: dict.ok_text,
    })

    return () => {
      errorModalsRef.current.history?.destroy()
      errorModalsRef.current.history = null
    }
  }
}

export const useShowActivityError = (
  { lang, historyError, error, isError, isHistoryError, errorCode, errorModalsRef, intl }:
  { lang: Lang, historyError?: CustomBaseQueryError, error?: string, isError?: boolean, isHistoryError?: boolean, errorCode?: number, errorModalsRef: React.MutableRefObject<{
    restoreActivity: {
      destroy: () => void;
      update: (configUpdate: object) => void;
    };
    history: {
      destroy: () => void;
      update: (configUpdate: object) => void;
    };
  }>, intl: Record<string, any> },
) => {
  const navigate = useNavigate()
  const { title, ok_text, default_content } = intl.modal.common

  useEffect(() => {
    const historyErrorText = (historyError as CustomBaseQueryError)?.data?.error?.message?.text?.[lang || 'eng']
    return showActivityErrors(
      {
        error,
        isError,
      },
      {
        error: historyErrorText,
        isError: isHistoryError,
      },
      errorCode,
      errorModalsRef,
      {
        title,
        default_content,
        ok_text,
      },
      navigate,
    )
  }, [ !!error, isError, isHistoryError, historyError ])
}

export const useLoadWorkoutList = ({
  isEdit, workoutList, workoutListStatus, initialValues, form, intl,
}: {
  isEdit: boolean, workoutList: WorkoutListItem[], workoutListStatus: ApiStatus, initialValues: InitialValues<Dayjs>, form: FormInstance<ActivityForm>, intl: Record<string, any>
}) => {
  const dispatch = useAppDispatch()
  const [ fetchWorkoutList ] = workoutApi.useLazyListQuery()
  const { runLoader, stopLoaderById } = useAppLoaderContext()

  useEffect(() => {
    let isArchivedWorkoutInActivity = false
    fetchWorkoutList({ inActivity: initialValues.id })
      .unwrap()
      .then(({ data }) => {
        isArchivedWorkoutInActivity = data.some(workout => workout.archived)
      })

    if (isEdit) form.setFieldsValue(initialValues)

    return () => {
      stopLoaderById('workout_list_loader')

      if (isArchivedWorkoutInActivity) {
        workoutApi.util.invalidateTags([ WORKOUT_TAG_TYPES.WORKOUT_LIST ])
        dispatch(updateList(workoutList.filter(workout => !workout.archived)))
      }
    }
  }, [])

  useLayoutEffect(() => {
    if (workoutListStatus === API_STATUS.LOADING) {
      runLoader('workout_list_loader', { spinProps: { tip: intl.pages.activities.loader.workouts_loading } })
    } else if (workoutListStatus === API_STATUS.LOADED || workoutListStatus === API_STATUS.ERROR) {
      stopLoaderById('workout_list_loader')
    }
  }, [ workoutListStatus ])
}

export const useRestoreActivityFromCacheOnWorkoutListLoaded = ({
  isEdit, getCachedFormValues, workoutListStatus, setSelectedWorkout, setCachedFormValues, initFromCacheRef, handleRestoreFromCacheError,
}: {
  isEdit: boolean,
  getCachedFormValues: () => InitialValues,
  workoutListStatus: ApiStatus,
  setSelectedWorkout: React.Dispatch<React.SetStateAction<Pick<WorkoutForm, 'id'>>>,
  setCachedFormValues: SetValue<InitialValues>,
  initFromCacheRef: MutableRefObject<boolean>,
  handleRestoreFromCacheError: VoidFunction,
}) => {
  useLayoutEffect(() => {
    const _cachedFormValues = getCachedFormValues()

    if (!isEdit && _cachedFormValues && workoutListStatus === API_STATUS.LOADED) {
      try {
        if (!_cachedFormValues) {
          throw new Error('No cached form values')
        }

        setSelectedWorkout(_cachedFormValues.workout_id)
        setCachedFormValues(_cachedFormValues)
        initFromCacheRef.current = true
      } catch {
        handleRestoreFromCacheError()
      }
    }
  }, [ workoutListStatus ])
}
