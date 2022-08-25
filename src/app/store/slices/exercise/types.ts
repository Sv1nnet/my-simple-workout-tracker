import { IResponse } from 'app/constants/response_types'
import { Dayjs } from 'dayjs'

export type Image = {
  uid: string,
  url: string,
  name: string,
}

export type ExerciseType = 'repeats' | 'time' | 'duration' | 'distance' | 'weight' | 'time_distance' | 'time_repeats'

export type Exercise<T = number | Dayjs> = {
  _id?: string;
  id?: string;
  title: string;
  each_side: boolean;
  mass_unit: 'kg' | 'lb'
  hours?: boolean;
  type?: ExerciseType;
  time?: T;
  repeats?: number;
  weight?: string;
  description?: string;
  image?: Image;
}

export type ExerciseForm = Omit<Exercise, 'image'> & {
  image?: Image | Image[];
}

export type ExerciseServerPayload = Omit<Exercise<number>, 'image'> & {
  image?: Image;
}

export interface IExerciseFormData extends ExerciseForm, FormData {}

export type ExerciseCreateSuccess = IResponse<ExerciseServerPayload>

export type ExerciseUpdateSuccess = IResponse<ExerciseServerPayload>

export type ExerciseDeleteSuccess = IResponse<ExerciseServerPayload[]>
export type ExerciseDeleteError = IResponse<null>

export type GetExerciseSuccess = IResponse<ExerciseForm>
export type GetExerciseError = IResponse<null>

export type GetExerciseListSuccess = IResponse<ExerciseServerPayload[]>
export type GetExerciseListError = IResponse<null>

export type ExerciseError = IResponse
