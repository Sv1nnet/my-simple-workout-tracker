import EntityModel from 'app/store/utils/EntityModel'
import { ExerciseType, MassUnit } from '../types'
import browserDB from 'app/store/utils/BrowserDB'
import { ImageConstructorParameter, ImageModel } from './ImageModel'
import { WorkoutModel } from 'app/store/slices/workout/models/WorkoutModel'

export type ExerciseModelConstructorParameter = Omit<ExerciseModel, 'image'> & { image: ImageConstructorParameter }

export type PlainExerciseObject = Pick<ExerciseModel,
'id' |
'updated_at' |
'created_at' |
'title' |
'type' |
'each_side' |
'hours' |
'is_in_workout' |
'in_workouts' |
'archived' |
'image' |
'time' |
'description' |
'repeats' |
'weight' |
'mass_unit'>

// @ts-expect-error
export class ExerciseModel extends EntityModel {
  public title: string
  
  public type: ExerciseType = 'repeats'
  
  public each_side: boolean
  
  public hours: boolean = false
  
  public is_in_workout: boolean = false
  
  public in_workouts: string[] = []

  public archived: boolean = false

  public muscle_groups: string[] = []
  
  public is_default: boolean = false

  public is_favorite: boolean = false

  public image?: ImageModel

  public time?: number

  public description?: string
  
  public repeats?: number
  
  public weight?: number
  
  public mass_unit?: MassUnit

  public static override updateMany(exercises: ExerciseModel[]) {
    const { exercisesTable } = browserDB.getTables()
    return EntityModel.updateMany(exercisesTable.name, exercises)
  }

  public static deleteMany(exercises: ExerciseModel[]): Promise<number> {
    const { exercisesTable } = browserDB.getTables()
    return EntityModel.deleteMany(exercisesTable.name, exercises.map(exercise => exercise.id))
  }

  public static getOneFromDB(id: EntityModel['id']): Promise<ExerciseModel | undefined> {
    const { exercisesTable } = browserDB.getTables()
    return EntityModel.getOneFromDB(ExerciseModel, exercisesTable.name, id)
  }

  public static override getManyFromDB(ids: EntityModel['id'][]): Promise<ExerciseModel[]> {
    const { exercisesTable } = browserDB.getTables()
    return EntityModel.getManyFromDB(ExerciseModel, exercisesTable.name, ids)
  }

  public static override getAllFromDB(): Promise<ExerciseModel[]> {
    const { exercisesTable } = browserDB.getTables()
    return EntityModel.getAllFromDB(ExerciseModel, exercisesTable.name)
  }

  public static override removeFromDB(id: string): Promise<void> {
    const { exercisesTable } = browserDB.getTables()
    return EntityModel.removeFromDB(exercisesTable.name, id)
  }

  constructor({ id, created_at, updated_at, ...data }: ExerciseModelConstructorParameter | PlainExerciseObject) {
    super({ id, created_at, updated_at })

    if (data.image) {
      this.image = new ImageModel(data.image)
      delete data.image
    }
    if ('image_uid' in data) delete data.image_uid

    Object.assign(this, data)
  }

  async update({ image, ...data }: Partial<ExerciseModel>) {
    Object.assign(this, data)
    this.updated_at = Date.now()

    await image?.imageSetter
    await this.updateImage(image)

    return this
  }

  removeWorkout(workoutId: string) {
    this.in_workouts = this.in_workouts.filter(_workoutId => _workoutId !== workoutId)

    if (this.in_workouts.length === 0) {
      this.is_in_workout = false
    }
    return this
  }

  addWorkout(workoutId: string) {
    if (this.in_workouts.includes(workoutId)) {
      return this
    }

    this.in_workouts.push(workoutId)

    if (!this.is_in_workout) {
      this.is_in_workout = true
    }
    return this
  }

  addMuscleGroups(muscleGroups: string) {
    if (this.muscle_groups.includes(muscleGroups)) {
      return this
    }

    this.muscle_groups.push(muscleGroups)
    return this
  }

  removeMuscleGroups(muscleGroups: string) {
    this.muscle_groups = this.muscle_groups.filter(_muscleGroups => _muscleGroups !== muscleGroups)
    return this
  }

  toPlainObject() {
    return {
      ...this,
      image: this.image?.toPlainObject(),
    } as PlainExerciseObject
  }

  async isInWorkout(workouts?: WorkoutModel[]) {
    workouts = workouts || (await WorkoutModel.getAllFromDB())
    return !!workouts.find(workout => workout.exercises.find(exercise => exercise.id === this.id))
  }

  async inWorkouts(workouts?: WorkoutModel[]) {
    workouts = workouts || (await WorkoutModel.getAllFromDB())
    return workouts.filter(workout => !!workout.exercises.find(exercise => exercise.id === this.id))
  }

  archive() {
    this.archived = true
  }

  async delete(workouts?: any[]) {
    if (await this.isInWorkout(workouts)) {
      this.archived = true

      return this
    }

    await ExerciseModel.removeFromDB(this.id)
    return this
  }
  
  async updateImage(data: ImageModel) {
    if (!data) {
      this.image = undefined
    } else if (!this.image) {
      this.image = data
    } else {
      await this.image.updateImage(data)
    }
    return this
  }

  async save() {
    const { exercisesTable } = browserDB.getTables()
    await browserDB.db?.set(exercisesTable, this.id, this.toPlainObject())
    return this
  }

  getCopy() {
    return new ExerciseModel({
      ...this,
    })
  }
}
