import EntityModel from 'app/store/utils/EntityModel'

export type ActivityWorkoutConstructorParameter = ActivityExerciseModel

export class ActivityExerciseModel extends EntityModel {
  public original_id: string

  public id_in_workout: string

  public hours?: boolean

  public type: string

  public rounds: number | { right: number, left: number }

  public note?: string

  constructor(exercise: ActivityExerciseModel) {
    super(exercise)
    Object.assign(this, exercise)
  }
}
