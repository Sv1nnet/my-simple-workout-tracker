import { IResponse } from 'app/constants/response_types'
import { Dayjs } from 'dayjs'

export type Image = {
  uid: string,
  url: string,
  name: string,
}

export type Exercise = {
  id?: string;
  title: string;
  each_side: boolean;
  mass_unit: 'kg' | 'lb'
  type?: 'repeats' | 'time' | 'duration' | 'distance';
  time?: number | Dayjs;
  repeats?: number;
  weight?: string;
  description?: string;
  image?: Image;
}

export type ExerciseForm = Omit<Exercise, 'image'> & {
  image?: Image | Image[];
}

export interface IExerciseFormData extends ExerciseForm, FormData {}

export type ExerciseCreateSuccess = IResponse<ExerciseForm>

export type ExerciseUpdateSuccess = IResponse<ExerciseForm>

export type ExerciseDeleteSuccess = IResponse<ExerciseForm[]>
export type ExerciseDeleteError = IResponse<null>

export type GetExerciseSuccess = IResponse<ExerciseForm>
export type GetExerciseError = IResponse<null>

export type GetExerciseListSuccess = IResponse<Exercise[]>
export type GetExerciseListError = IResponse<null>

export type ExerciseError = IResponse
