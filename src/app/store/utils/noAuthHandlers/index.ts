import { exerciseHandlers } from 'app/store/slices/exercise'
import { workoutHandlers } from 'app/store/slices/workout'
import { activityHandlers } from 'app/store/slices/activity'
import { muscleGroupHandlers } from 'app/store/slices/muscleGroup'

const handlers = {
  exercise: exerciseHandlers.default,
  workout: workoutHandlers.default,
  activity: activityHandlers.default,
  'muscle-group': muscleGroupHandlers.default,
}

export type Handlers = typeof handlers

export default handlers
