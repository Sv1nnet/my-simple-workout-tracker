export const getComparator = (type: string) => type === 'time' 
  ? {
    pos: (curr, next) => curr < next,
    neg: (curr, next) => curr > next,
  }
  : {
    pos: (curr, next) => curr > next,
    neg: (curr, next) => curr < next,
  }

export const getResultsFromWorkoutList = (workoutList, workoutId) => workoutList
  .data
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
