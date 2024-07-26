import EntityModel from 'app/store/utils/EntityModel'

export type WorkoutExerciseConstructorParameter = WorkoutExerciseModel

export class WorkoutExerciseModel extends EntityModel {
  // id: this is exercise id in DB
  // _id: its own id
  public _id: string
  
  public rounds: number

  public round_break: number

  public break: number

  public break_enabled: boolean

  constructor(exercise: WorkoutExerciseModel) {
    super(exercise)
    this._id = EntityModel.createId() 
    Object.assign(this, exercise)
  }
}
