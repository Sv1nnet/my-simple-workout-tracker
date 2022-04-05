import { IResponse } from 'app/constants/response_types'
import { Dayjs } from 'dayjs'
import { Exercise } from '../exercise/types'

export type WorkoutListExercise<T = number | Dayjs> = {
  _id: string;
  id: string;
  exercise: Pick<Exercise, 'id' | 'title' | 'image' | 'repeats' | 'weight' | 'mass_unit' | 'time'>;
  rounds: number;
  round_break: T;
  break?: T;
  break_enabled: boolean;
}

export type WorkoutExercise<T = number | Dayjs> = {
  id: Pick<Exercise, 'id'>;
  rounds: number;
  round_break: T;
  break?: T;
  break_enabled: boolean;
}

export type Workout<T = number | Dayjs> = {
  id?: string;
  title: string;
  exercises: WorkoutExercise<T>[];
  description?: string;
}

export type WorkoutListItem<T = number | Dayjs> = {
  id: string;
  title: string;
  exercises: WorkoutListExercise<T>[];
  description?: string;
}

export type WorkoutForm = Workout

export type WorkoutServerPayload = Omit<Workout<number>, 'exercise'> & {
  exercise: Pick<Exercise, 'id' | 'title' | 'image' | 'repeats' | 'weight' | 'mass_unit' | 'time'> | Pick<Exercise, 'id'>;
}

export type WorkoutCreateSuccess = IResponse<WorkoutForm>

export type WorkoutUpdateSuccess = IResponse<WorkoutServerPayload>

export type WorkoutDeleteSuccess = IResponse<WorkoutServerPayload[]>
export type WorkoutDeleteError = IResponse<null>

export type GetWorkoutSuccess = IResponse<Workout>
export type GetWorkoutError = IResponse<null>

export type GetWorkoutListSuccess = IResponse<WorkoutServerPayload[]>
export type GetWorkoutListError = IResponse<null>

export type WorkoutError = IResponse
