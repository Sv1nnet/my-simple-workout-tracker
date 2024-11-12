import EntityModel from 'app/store/utils/EntityModel'
import browserDB from 'app/store/utils/BrowserDB'
import { ExerciseModel } from 'app/store/slices/exercise/models/ExerciseModel'
import { Optional } from 'utility-types'

export type MuscleGroupModelConstructorParameter = MuscleGroupModel

export type PlainMuscleGroupObject = Pick<MuscleGroupModel,
'id' |
'updated_at' |
'created_at' |
'in_exercises' |
'is_in_exercise' |
'title'>

// @ts-expect-error
export class MuscleGroupModel extends EntityModel {
  public title: string
  
  public in_exercises: string[]

  public is_in_exercise: boolean

  public archived: boolean

  public static async getOneFromDB(id: Pick<EntityModel, 'id'>): Promise<EntityModel | undefined> {
    const { exercisesTable } = browserDB.getTables()
    return EntityModel.getOneFromDB(MuscleGroupModel, exercisesTable.name, id)
  }

  public static override async getManyFromDB(ids: Pick<EntityModel, | 'id'>[]): Promise<MuscleGroupModel[]> {
    const { exercisesTable } = browserDB.getTables()
    return EntityModel.getManyFromDB(MuscleGroupModel, exercisesTable.name, ids)
  }

  public static override async getAllFromDB(): Promise<MuscleGroupModel[]> {
    const { exercisesTable } = browserDB.getTables()
    return EntityModel.getAllFromDB(MuscleGroupModel, exercisesTable.name)
  }

  constructor({ id, created_at, updated_at, ...data }: Optional<MuscleGroupModel, 'id'> | Optional<PlainMuscleGroupObject, 'id'>) {
    super({ id, created_at, updated_at })

    Object.assign(this, data)
  }

  update(data: Partial<MuscleGroupModel>) {
    Object.assign(this, data)
    this.updated_at = Date.now()

    return this
  }

  removeExercise(exerciseId: string) {
    this.in_exercises = this.in_exercises.filter(_exerciseId => _exerciseId !== exerciseId)
    if (this.in_exercises.length === 0) {
      this.is_in_exercise = false
    }
    return this
  }

  addExercise(exerciseId: string) {
    this.in_exercises.push(exerciseId)
    if (!this.is_in_exercise) {
      this.is_in_exercise = true
    }
    return this
  }

  toPlainObject() {
    return {
      ...this,
    } as PlainMuscleGroupObject
  }

  async isInExercise(exercises?: ExerciseModel[]) {
    const { exercisesTable } = browserDB.getTables()
    exercises = exercises || (await browserDB.db?.getAllValues(exercisesTable)).map(exercise => JSON.parse(exercise))
    return !!exercises.find(exercise => exercise.muscle_groups.find(muscleGroupId => muscleGroupId === this.id))
  }

  async inExercises(exercises?: ExerciseModel[]) {
    const { exercisesTable } = browserDB.getTables()
    exercises = exercises || (await browserDB.db?.getAllValues(exercisesTable)).map(exercise => JSON.parse(exercise))
    return exercises.filter(exercise => !!exercise.muscle_groups.find(muscleGroupId => muscleGroupId === this.id))
  }

  async delete(exercises?: ExerciseModel[]) {
    const { exercisesTable, muscleGroupsTable } = browserDB.getTables()
    exercises = exercises || (await browserDB.db?.getAllValues(exercisesTable)).map(exercise => JSON.parse(exercise))

    if (await this.isInExercise(exercises)) {
      this.archived = true

      await this.save()

      return this
    }

    await browserDB.db?.remove(muscleGroupsTable, this.id)
    return this
  }

  async save() {
    const { muscleGroupsTable } = browserDB.getTables()
    await browserDB.db?.set(muscleGroupsTable, this.id, this.toString())
    return this
  }

  getCopy() {
    return new MuscleGroupModel({
      ...this,
    })
  }
}
