import { dayjsToSeconds, isExerciseTimeType, secondsToDayjs, timeArrayToMilliseconds } from 'app/utils/time'
import { WorkoutForm, WorkoutListItem } from 'app/store/slices/workout/types'
import dayjs, { Dayjs, isDayjs } from 'dayjs'
import { InitialValues } from '../types'
import { MutableRefObject } from 'react'
import { FormInstance } from 'antd'
import { ActivityForm } from 'app/store/slices/activity/types'

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
}) => {
  if (isEdit && initialValues === null) return {}
  
  let newInitialValues
  try {
    if (!isEdit && cachedFormValues && selectedWorkout && initFromCacheRef.current) {
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
        results: initialValues.results.map(results => isExerciseTimeType(results.type)
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
    return {
      _id: undefined,
      workout_id: undefined,
      duration: 0,
      date: undefined,
      results: [],
      description: '',
    }
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
