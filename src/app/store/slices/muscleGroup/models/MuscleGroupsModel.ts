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

  public is_default: boolean

  public static async getOneFromDB(id: EntityModel['id']): Promise<MuscleGroupModel | undefined> {
    const { muscleGroupsTable } = browserDB.getTables()
    return EntityModel.getOneFromDB(MuscleGroupModel, muscleGroupsTable.name, id)
  }

  public static override async getManyFromDB(ids: EntityModel['id'][]): Promise<MuscleGroupModel[]> {
    const { muscleGroupsTable } = browserDB.getTables()
    return EntityModel.getManyFromDB(MuscleGroupModel, muscleGroupsTable.name, ids)
  }

  public static override async getAllFromDB(): Promise<MuscleGroupModel[]> {
    const { muscleGroupsTable } = browserDB.getTables()
    return EntityModel.getAllFromDB(MuscleGroupModel, muscleGroupsTable.name)
  }

  public static override updateMany(muscleGroups: MuscleGroupModel[]) {
    const { muscleGroupsTable } = browserDB.getTables()
    return EntityModel.updateMany(muscleGroupsTable.name, muscleGroups)
  }

  public static override async removeFromDB(id: string): Promise<void> {
    const { muscleGroupsTable } = browserDB.getTables()
    await EntityModel.removeFromDB(muscleGroupsTable.name, id)
    return
  }

  public static async deleteMany(muscleGroups: MuscleGroupModel[]) {
    const { muscleGroupsTable } = browserDB.getTables()
    return EntityModel.deleteMany(muscleGroupsTable.name, muscleGroups.map(muscleGroup => muscleGroup.id))
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
    exercises = exercises || (await ExerciseModel.getAllFromDB())
    return !!exercises.find(exercise => exercise.muscle_groups.find(muscleGroupId => muscleGroupId === this.id))
  }

  async inExercises(exercises?: ExerciseModel[]) {
    exercises = exercises || (await ExerciseModel.getAllFromDB())
    return exercises.filter(exercise => !!exercise.muscle_groups.find(muscleGroupId => muscleGroupId === this.id))
  }

  async delete() {
    await MuscleGroupModel.removeFromDB(this.id)
    return this
  }

  async save() {
    const { muscleGroupsTable } = browserDB.getTables()
    await browserDB.db?.set(muscleGroupsTable, this.id, this.toPlainObject())
    return this
  }

  getCopy() {
    return new MuscleGroupModel({
      ...this,
    })
  }
}
