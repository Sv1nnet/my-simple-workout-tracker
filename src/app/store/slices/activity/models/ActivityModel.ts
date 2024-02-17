
import EntityModel from 'app/store/utils/EntityModel'
import db from 'app/store/BrowserDB'
import { ActivityExerciseModel } from './ActivityExerciseModel'
import { table } from '../utils'

export type ActivityModelConstructorParameter = Pick<ActivityModel, 'id' | 'created_at' | 'updated_at' | 'workout_id' | 'index' | 'date' | 'results' | 'description' | 'duration'>

export class ActivityModel extends EntityModel {
  public workout_id: string

  public index: number

  public date: string
  
  public results: ActivityExerciseModel[] = []

  public description: string

  public duration: number

  constructor({ id, created_at, updated_at, results, ...data }: ActivityModelConstructorParameter) {
    super({ id, created_at, updated_at })

    const workoutResult = results.map(result => new ActivityExerciseModel(result))

    Object.assign(this, data, {
      results: workoutResult,
    })
  }

  update(data: Partial<ActivityModel>) {
    Object.assign(this, {
      ...data,
      index: new Date(data.date).valueOf(),
    })
    this.updated_at = Date.now()

    return this
  }

  async delete() {
    await db.remove(table, this.id)
    return this
  }

  async save() {
    db.set(table, this.id, this.toString())
    return this
  }
}