import EntityModel from '../store/utils/EntityModel'

export type BaseParsedDataEntity = Pick<EntityModel, 'id' | 'created_at' | 'updated_at'>

const parseImportedDataFile = async (data: File) => {
  const text = await data.text()
  const { activities, exercises, workouts } = JSON.parse(text)

  return {
    activities: activities.map(activity => JSON.parse(activity)),
    exercises: exercises.map(exercise => JSON.parse(exercise)),
    workouts: workouts.map(workout => JSON.parse(workout)),
  } as {
    activities: BaseParsedDataEntity[],
    exercises: BaseParsedDataEntity[],
    workouts: BaseParsedDataEntity[]
  }
}

export default parseImportedDataFile
