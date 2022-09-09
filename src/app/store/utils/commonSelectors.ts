import { AppState } from '..'

export const selectAllLists = (state: AppState) => ({
  exerciseList: state.exercise.list,
  workoutList: state.workout.list,
  activityList: state.activity.list,
})
