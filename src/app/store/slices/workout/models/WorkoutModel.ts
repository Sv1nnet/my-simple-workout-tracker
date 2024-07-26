
import EntityModel from 'app/store/utils/EntityModel'
import { WorkoutExerciseModel } from './WorkoutExerciseModel'
import browserDB from 'app/store/utils/BrowserDB'
import { ActivityModel } from 'app/store/slices/activity/models/ActivityModel'

export type WorkoutModelConstructorParameter = WorkoutModel

export type PlainWorkoutObject = Pick<WorkoutModel,
'title' |
'exercises' |
'description' |
'archived' |
'is_in_activity' |
'in_activities' |
'id' |
'created_at' |
'updated_at'>

// @ts-expect-error
export class WorkoutModel extends EntityModel {
  public title: string
  
  public exercises: WorkoutExerciseModel[] = []

  public description: string

  public archived: boolean = false
  
  public is_in_activity: boolean = false

  public in_activities: string[] = []

  public static async getOneFromDB(id: Pick<EntityModel, | 'id'>): Promise<WorkoutModel | undefined> {
    const { workoutsTable } = browserDB.getTables()
    return EntityModel.getOneFromDB(WorkoutModel, workoutsTable.name, id)
  }

  public static async getManyFromDB(ids: Pick<EntityModel, | 'id'>[]): Promise<WorkoutModel[]> {
    const { workoutsTable } = browserDB.getTables()
    return EntityModel.getManyFromDB(WorkoutModel, workoutsTable.name, ids)
  }

  public static async getAllFromDB(): Promise<WorkoutModel[]> {
    const { workoutsTable } = browserDB.getTables()
    return EntityModel.getAllFromDB(WorkoutModel, workoutsTable.name)
  }

  constructor({ id, created_at, updated_at, exercises, ...data }: WorkoutModelConstructorParameter | PlainWorkoutObject) {
    super({ id, created_at, updated_at })

    const exerciseInWorkout = exercises.map(exercise => new WorkoutExerciseModel(exercise))

    Object.assign(this, {
      ...data,
      exercises: exerciseInWorkout,
    })
  }

  update(data: Partial<WorkoutModel>) {
    Object.assign(this, data)
    this.updated_at = Date.now()

    return this
  }

  addActivity(activityId: string) {
    this.is_in_activity = true
    this.in_activities.push(activityId)

    return this
  }

  removeFromActivity(activityId: string) {
    this.in_activities = this.in_activities?.filter(id => id !== activityId) || []
    if (this.in_activities.length === 0) {
      this.is_in_activity = false
    }
    return this
  }

  async isInActivity(activities?: Partial<ActivityModel>[]) {
    const { activitiesTable } = browserDB.getTables()
    activities = activities || (await browserDB.db.getAllValues(activitiesTable)).map(activity => JSON.parse(activity))
    return !!activities.find(activity => activity.workout_id === this.id)
  }

  async inActivities(activities?: Partial<ActivityModel>[]) {
    const { activitiesTable } = browserDB.getTables()
    activities = activities || (await browserDB.db.getAllValues(activitiesTable)).map(activity => JSON.parse(activity))
    return activities.filter(activity => activity.workout_id === this.id)
  }

  /**
   * Для принудительного удаления нужно передать пустой массив.
   * Это  нужно, когда, например, мы точно знаем, что тренировки нет
   * ни в одной активности.
   */
  async delete(activities?: Partial<ActivityModel>[]) {
    const { workoutsTable } = browserDB.getTables()
    if (await this.isInActivity(activities)) {
      this.archived = true

      await this.save()

      return this
    }

    await browserDB.db.remove(workoutsTable, this.id)
    return this
  }

  async save() {
    const { workoutsTable } = browserDB.getTables()
    browserDB.db.set(workoutsTable, this.id, this.toString())
    return this
  }

  async getCopy() {
    return new WorkoutModel({
      ...this,
      exercises: this.exercises.map(exercise => new WorkoutExerciseModel(exercise)),
    })
  }
}