import { exerciseHandlers } from 'app/store/slices/exercise'
import { workoutHandlers } from 'app/store/slices/workout'
import { activityHandlers } from 'app/store/slices/activity'

const handlers = {
  exercise: exerciseHandlers.default,
  workout: workoutHandlers.default,
  activity: activityHandlers.default,
}

export type Handlers = typeof handlers

export default handlers
