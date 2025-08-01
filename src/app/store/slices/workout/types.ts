import { IResponse } from 'app/constants/response_types'
import { Dayjs } from 'dayjs'
import { Exercise, MuscleGroup } from 'store/slices/exercise/types'

export type WorkoutListExercise<T = number | Dayjs> = {
  _id: Exercise['id'];
  id: Exercise['id'];
  details: Exercise;
  rounds: number;
  round_break: T;
  weight?: number;
  repeats?: number;
  time?: number;
  break?: T;
  break_enabled: boolean;
}

export type WorkoutExercise<T = number | Dayjs> = {
  id: Exercise['id'];
  rounds: number;
  break_enabled: boolean;
  repeats?: number;
  round_break: T;
  weight?: number;
  details: Exercise;
  time?: number;
  break?: T;
  _id?: string;
}

export type Workout<T = number | Dayjs> = {
  id?: string;
  title: string;
  exercises: WorkoutExercise<T>[];
  is_in_activity?: boolean;
  description?: string;
}

export type WorkoutListItem<T = number | Dayjs> = {
  id: string;
  title: string;
  muscle_groups: MuscleGroup[];
  exercises: WorkoutListExercise<T>[];
  archived?: boolean;
  description?: string;
}

export type WorkoutForm = Workout

export type WorkoutServerPayload = Omit<Workout<number>, 'exercise'> & {
  exercise: Pick<Exercise, 'id' | 'title' | 'image'> | Pick<Exercise, 'id'>;
}

export type WorkoutCreateSuccess = IResponse<WorkoutForm>

export type WorkoutUpdateSuccess = IResponse<WorkoutServerPayload>

export type WorkoutRestoreSuccess = IResponse<null>
export type WorkoutRestoreError = IResponse<null>

export type WorkoutDeleteSuccess = IResponse<WorkoutServerPayload[]>
export type WorkoutDeleteError = IResponse<null>

export type GetWorkoutSuccess<T = number> = IResponse<Workout<T>>
export type GetWorkoutError = IResponse<null>

export type GetWorkoutListSuccess = IResponse<WorkoutListItem[]>
export type GetWorkoutListError = IResponse<null>

export type WorkoutError = IResponse

export type WorkoutListParams = { archived?: boolean, inActivity?: string, include?: string }
