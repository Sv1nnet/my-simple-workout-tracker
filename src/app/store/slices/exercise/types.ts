import { IResponse } from 'app/constants/response_types'

export type Image = {
  uid: string,
  url: string,
  name: string,
}

export type ExerciseType = 'repeats' | 'time' | 'duration' | 'distance' | 'weight' | 'time_distance' | 'time_repeats'

export type MassUnit = 'kg' | 'lb'

export type Exercise = {
  _id?: string;
  id?: string;
  is_in_workout: boolean;
  title: string;
  each_side: boolean;
  archived: boolean;
  muscle_groups: MuscleGroup[];
  hours?: boolean;
  type?: ExerciseType;
  description?: string;
  image?: Image;
  is_default?: boolean;
}

export type MuscleGroup = {
  id: string,
  title: string,
  archived?: boolean,
}

export type ExerciseForm = Omit<Exercise, 'image' | 'muscle_groups'> & {
  muscle_groups: ({ value: string, label: string } | string)[];
  image?: Image | Image[];
}

export type ExerciseListItem = Omit<ExerciseForm, 'id' | 'muscle_groups'> & {
  id: string,
  muscle_groups: MuscleGroup[],
}

export type ExerciseServerPayload = Omit<Exercise, 'image' | 'muscle_groups'> & {
  image?: Image;
  muscle_groups: string[];
}

export interface IExerciseFormData extends ExerciseForm, FormData {}

export type ExerciseCreateSuccess = IResponse<ExerciseServerPayload>

export type ExerciseUpdateSuccess = IResponse<ExerciseServerPayload>

export type ExerciseDeleteSuccess = IResponse<ExerciseServerPayload[]>
export type ExerciseDeleteError = IResponse<null>

export type ExerciseCopySuccess = IResponse<null>
export type ExerciseCopyError = IResponse<null>

export type ExerciseRestoreSuccess = IResponse<null>
export type ExerciseRestoreError = IResponse<null>

export type GetExerciseServerPayload = Omit<ExerciseForm, 'muscle_groups'> & { muscle_groups: MuscleGroup[] }
export type GetExerciseSuccess = IResponse<ExerciseForm & { is_in_activity?: boolean }>
export type GetExerciseError = IResponse<null>

export type GetExerciseListSuccess = IResponse<ExerciseListItem[]>
export type GetExerciseListError = IResponse<null>

export type ExerciseError = IResponse
