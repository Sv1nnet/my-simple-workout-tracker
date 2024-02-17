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
  hours?: boolean;
  type?: ExerciseType;
  time?: T;
  repeats?: number;
  weight?: string;
  description?: string;
  image?: Image;
}

export type ExerciseForm<T = number | Dayjs> = Omit<Exercise<T>, 'image'> & {
  image?: Image | Image[];
}

export type ExerciseListItem<T = number | Dayjs> = Omit<ExerciseForm<T>, 'id'> & {
  id: string,
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

export type GetExerciseSuccess = IResponse<ExerciseForm<number | Dayjs>>
export type GetExerciseError = IResponse<null>

export type GetExerciseListSuccess = IResponse<ExerciseListItem<number>[]>
export type GetExerciseListError = IResponse<null>

export type ExerciseError = IResponse
