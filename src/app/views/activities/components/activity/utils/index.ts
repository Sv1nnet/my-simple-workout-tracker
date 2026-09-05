import { dayjsToSeconds, isExerciseTimeType, secondsToDayjs, timeArrayToMilliseconds } from 'app/utils/time'
import { WorkoutForm, WorkoutListItem } from 'app/store/slices/workout/types'
import dayjs, { Dayjs, isDayjs } from 'dayjs'
import { InitialValues } from '../types'
import React, { MutableRefObject, useEffect, useLayoutEffect } from 'react'
import { FormInstance, Modal } from 'antd'
import { ActivityForm, CachedActivity } from 'app/store/slices/activity/types'
import { NavigateFunction, useNavigate } from 'react-router'
import { CustomBaseQueryError } from 'app/store/utils/baseQueryWithReauth'
import { Lang } from 'app/store/slices/settings/types'
import { API_STATUS, ApiStatus } from 'app/constants/api_statuses'
import { WORKOUT_TAG_TYPES, workoutApi } from 'app/store/slices/workout/api'
import { updateList } from 'app/store/slices/workout'
import { useAppLoaderContext } from 'app/contexts/loader/AppLoaderContextProvider'
import { SetValue, useAppDispatch } from 'app/hooks'
import { isNumber, isObject, isString } from 'app/utils/typeCheckers'

export const getComparator = (type: string) => type === 'time' 
  ? {
    pos: (curr, next) => curr < next,
    neg: (curr, next) => curr > next,
  }
  : {
    pos: (curr, next) => curr > next,
    neg: (curr, next) => curr < next,
  }

export const getResultsFromWorkoutList = (workoutList: WorkoutListItem[], workoutId: WorkoutForm['id']) => workoutList
  .find(wk => wk.id === workoutId)
// TODO: on the server - exercise -> details
  ?.exercises
  ?.map(({ rounds, _id, details }) => ({
    _id,
    hours: details.hours,
    original_id: details.id,
    id_in_workout: _id,
    type: details.type,
    rounds: Array.from({ length: rounds }, () => details.each_side ? { left: null, right: null } : null),
    note: undefined,
  })) || []

/** Merge cached activity results with current workout exercise metadata (ids, types) for the activity form. */
export const mapCachedResultsToFormInitials = (
  cachedResults: NonNullable<CachedActivity['results']>,
  workout: WorkoutListItem,
): InitialValues<Dayjs>['results'] =>
  cachedResults.map((results, i) => {
    const { _id, details } = workout.exercises[i]
    return isExerciseTimeType(details.type)
      ? {
        _id,
        hours: details.hours,
        original_id: details.id,
        id_in_workout: _id,
        type: details.type,
        ...results,
        rounds: results.rounds.map((round: string | { right: string, left: string }) => {
          if (round === null || round === '') return ''

          return (isObject(round))
            ? { right: round.right !== null && round.right !== '' ? dayjs(round.right) : '', left: round.left !== null && round.left !== '' ? dayjs(round.left) : '' }
            : dayjs(round as string)
        }),
      }
      : {
        ...results,
        _id,
        hours: details.hours,
        original_id: details.id,
        id_in_workout: _id,
        type: details.type,
        rounds: results.rounds.map((round: string | { right: string, left: string }) => {
          if (round === null || round === '') return ''

          return (isObject(round))
            ? {
              right: round.right !== null && round.right !== '' ? +round.right : '',
              left: round.left !== null && round.left !== '' ? +round.left : '',
            }
            : +round
        }),
      }
  })

const defaultInitialValues = {
  _id: undefined,
  isRunning: false,
  isPaused: false,
  isStopped: false,
  workout_id: '',
  duration: 0,
  date: undefined,
  results: [],
  description: '',
} as InitialValues<Dayjs>

export const getInitialActivityValues = ({
  initialValues,
  workoutList,
  cachedActivity,
  selectedWorkout,
  form,
  handleRestoreFromCacheError,
  isEdit,
}: {
  initialValues: InitialValues<string>,
  workoutList: WorkoutListItem[],
  cachedActivity: CachedActivity | null,
  selectedWorkout: WorkoutForm['id'],
  form: FormInstance<ActivityForm>,
  handleRestoreFromCacheError: VoidFunction,
  isEdit?: boolean,
}): InitialValues<Dayjs> => {
  if (isEdit && initialValues === null) {
    return { ...defaultInitialValues }
  }

  let newInitialValues: InitialValues<Dayjs>
  try {
    if (!isEdit && cachedActivity) {
      const workout = workoutList?.find(wk => wk.id === cachedActivity.workout_id)
      const canMergeCachedResults = Boolean(
        workout
        && cachedActivity.results?.length
        && cachedActivity.results.length === workout.exercises.length,
      )

      newInitialValues = {
        id: initialValues._id,
        duration: cachedActivity.duration,
        isRunning: cachedActivity.isRunning,
        isPaused: cachedActivity.isPaused,
        isStopped: cachedActivity.isStopped,
        date: isString(cachedActivity.date) ? dayjs(new Date(cachedActivity.date)) : dayjs(cachedActivity.date),
        workout_id: selectedWorkout,
        results: canMergeCachedResults && workout
          ? mapCachedResultsToFormInitials(cachedActivity.results, workout)
          : (workoutList && cachedActivity.workout_id ? getResultsFromWorkoutList(workoutList, cachedActivity.workout_id) : []),
        description: cachedActivity.description || '',
      }
    } else if (!isEdit) {
      newInitialValues = {
        id: initialValues._id,
        duration: 0,
        isRunning: false,
        isPaused: false,
        isStopped: false,
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
            rounds: results.rounds.map((round: number | { right: number, left: number }) => isObject(round)
              ? { right: secondsToDayjs(round.right), left: secondsToDayjs(round.left) }
              : secondsToDayjs(round as number)),
          }
          : results),
        // Server payload may echo form fields; session flags must not stay "running" when editing a saved activity.
        isRunning: false,
        isPaused: false,
        isStopped: false,
      }
    }

    return newInitialValues
  } catch (e) {
    handleRestoreFromCacheError()
    return { ...defaultInitialValues }
  }
}

export const getActivityValuesToSubmit = ({ ...values }, initialValues, workoutList, currentDuration) => {
  values.id = initialValues.id
  values.duration = timeArrayToMilliseconds(currentDuration)
  values.date = values.date.toJSON()
  values.results = values.results.reduce((acc, { id, rounds, note }, i) => {
    const exercise = workoutList.find(workout => workout.id === values.workout_id).exercises[i]
    const { details } = exercise

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
          return isNumber(round) || isString(round)
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
  }

  if (historyErrorText || isHistoryError) {
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
  form,
  isEdit,
  getCachedFormValues,
  workoutListStatus,
  setSelectedWorkout,
  setCachedFormValues,
  initFromCacheRef,
  handleRestoreFromCacheError,
  workoutList,
}: {
  form: FormInstance<ActivityForm>,
  isEdit: boolean,
  handleSelectedWorkoutChange: (value: WorkoutForm['id']) => void,
  getCachedFormValues: () => CachedActivity,
  workoutListStatus: ApiStatus,
  setSelectedWorkout: React.Dispatch<React.SetStateAction<WorkoutForm['id']>>,
  setCachedFormValues: SetValue<CachedActivity>,
  initFromCacheRef: MutableRefObject<boolean>,
  handleRestoreFromCacheError: VoidFunction,
  workoutList: WorkoutListItem[],
}) => {
  useLayoutEffect(() => {
    const _cachedFormValues = getCachedFormValues()

    if (!isEdit && _cachedFormValues && workoutListStatus === API_STATUS.LOADED) {
      try {
        if (!_cachedFormValues) {
          throw new Error('No cached form values')
        }

        if (workoutListStatus === API_STATUS.LOADED && !workoutList?.find(workout => workout.id === _cachedFormValues.workout_id)) {
          setSelectedWorkout(null)
          form.setFieldsValue({ workout_id: null })
          throw new Error('Workout not found')
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
