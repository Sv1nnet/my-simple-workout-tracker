import { IResponse } from 'app/constants/response_types'
import { Dayjs } from 'dayjs'

export type Image = {
  uid: string,
  url: string,
  name: string,
}

export type ExerciseType = 'repeats' | 'time' | 'duration' | 'distance' | 'weight' | 'time_distance' | 'time_repeats'

export type MassUnit = 'kg' | 'lb'

export type Exercise<T = number | Dayjs> = {
  _id?: string;
  id?: string;
  is_in_workout: boolean;
  title: string;
  each_side: boolean;
  mass_unit: MassUnit;
  archived: boolean;
  muscle_groups: string[];
  hours?: boolean;
  type?: ExerciseType;
  time?: T;
  repeats?: number;
  weight?: number;
  description?: string;
  image?: Image;
}

export type MuscleGroup = {
  id: string,
  title: string,
}

export type ExerciseForm<T = number | Dayjs> = Omit<Exercise<T>, 'image'> & {
  muscle_groups: MuscleGroup[];
  image?: Image | Image[];
}

export type ExerciseListItem<T = number | Dayjs> = Omit<ExerciseForm<T>, 'id' | 'muscle_groups'> & {
  id: string,
  muscle_groups: MuscleGroup[],
}

export type ExerciseServerPayload = Omit<Exercise<number>, 'image'> & {
  image?: Image;
}

export interface IExerciseFormData extends ExerciseForm, FormData {}

export type ExerciseCreateSuccess = IResponse<ExerciseServerPayload>

export type ExerciseUpdateSuccess = IResponse<ExerciseServerPayload>

export type ExerciseDeleteSuccess = IResponse<ExerciseServerPayload[]>
export type ExerciseDeleteError = IResponse<null>

export type ExerciseCopySuccess = IResponse<null>
export type ExerciseCopyError = IResponse<null>

export type GetExerciseServerPayload = Omit<ExerciseForm<number>, 'muscle_groups'> & { muscle_groups: MuscleGroup[] }
export type GetExerciseSuccess = IResponse<ExerciseForm<number | Dayjs>>
export type GetExerciseError = IResponse<null>

export type GetExerciseListSuccess = IResponse<ExerciseListItem<number>[]>
export type GetExerciseListError = IResponse<null>

export type ExerciseError = IResponse
