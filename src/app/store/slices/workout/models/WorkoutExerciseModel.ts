import EntityModel from 'app/store/utils/EntityModel'

export type WorkoutExerciseConstructorParameter = WorkoutExerciseModel
export type PlainWorkoutExercise = Pick<WorkoutExerciseModel,
'_id' |
'id' |
'rounds' |
'round_break' |
'break' |
'break_enabled' |
'updated_at' |
'created_at'
>

export class WorkoutExerciseModel extends EntityModel {
  // id: this is exercise id in DB
  // _id: its own id
  public _id: string
  
  public rounds: number

  public round_break: number

  public break: number

  public break_enabled: boolean

  constructor(exercise: WorkoutExerciseModel | PlainWorkoutExercise) {
    super(exercise)
    this._id = EntityModel.createId() 
    Object.assign(this, exercise)
  }

  toPlainObject(): PlainWorkoutExercise {
    return { ...this }
  }
}
