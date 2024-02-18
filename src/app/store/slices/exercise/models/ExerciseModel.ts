
import EntityModel from 'app/store/utils/EntityModel'
import { ExerciseType, MassUnit } from '../types'
import browserDB from 'app/store/BrowserDB'
import { ImageConstructorParameter, ImageModel } from './ImageModel'
import { WorkoutModel } from '../../workout/models/WorkoutModel'

export type ExerciseModelConstructorParameter = Omit<ExerciseModel, 'image'> & { image: ImageConstructorParameter }

export class ExerciseModel extends EntityModel {
  public title: string
  
  public type: ExerciseType = 'repeats'
  
  public each_side: boolean
  
  public hours: boolean = false
  
  public is_in_workout: boolean = false
  
  public in_workouts: string[] = []

  public archived: boolean = false
  
  public image?: ImageModel

  public time?: number

  public description?: string
  
  public repeats?: number
  
  public weight?: number
  
  public mass_unit?: MassUnit

  constructor({ id, created_at, updated_at, ...data }: ExerciseModelConstructorParameter) {
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

  removeFromWorkout(workoutId: string) {
    this.in_workouts = this.in_workouts.filter(_workoutId => _workoutId !== workoutId)
    if (this.in_workouts.length === 0) {
      this.is_in_workout = false
    }
    return this
  }

  async isInWorkout(workouts?: WorkoutModel[]) {
    const { workoutsTable } = browserDB.getTables()
    workouts = workouts || (await browserDB.db?.getAllValues(workoutsTable)).map(workout => JSON.parse(workout))
    return !!workouts.find(workout => workout.exercises.find(exercise => exercise.id === this.id))
  }

  async inWorkouts(workouts?: WorkoutModel[]) {
    const { workoutsTable } = browserDB.getTables()
    workouts = workouts || (await browserDB.db?.getAllValues(workoutsTable)).map(workout => JSON.parse(workout))
    return workouts.filter(workout => !!workout.exercises.find(exercise => exercise.id === this.id))
  }

  async delete(workouts?: any[]) {
    const { exercisesTable } = browserDB.getTables()

    if (await this.isInWorkout(workouts)) {
      this.archived = true

      await this.save()

      return this
    }

    await browserDB.db?.remove(exercisesTable, this.id)
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
    browserDB.db?.set(exercisesTable, this.id, this.toString())
    return this
  }
}