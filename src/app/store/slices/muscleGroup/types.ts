import { IResponse } from 'app/constants/response_types'

export type MuscleGroup = {
  id: string;
  title: string;
  is_default: boolean;
  /*
    Indicates if the muscle group created on frontend, and still not saved to the server.
    After saving on the server the id should be replaced with the one server sent.
  */
  idFromClient?: string;
}

export type MuscleGroupForm = MuscleGroup

export type MuscleGroupListItem = MuscleGroup

export type MuscleGroupServerPayload = MuscleGroup

export type MuscleGroupCreateSuccess = IResponse<MuscleGroupServerPayload>

export type MuscleGroupUpdateSuccess = IResponse<MuscleGroupServerPayload>

export type MuscleGroupDeleteSuccess = IResponse<MuscleGroupServerPayload[]>
export type MuscleGroupDeleteError = IResponse<null>

export type MuscleGroupCopySuccess = IResponse<null>
export type MuscleGroupCopyError = IResponse<null>

export type GetMuscleGroupSuccess = IResponse<MuscleGroupForm>
export type GetMuscleGroupError = IResponse<null>

export type GetMuscleGroupListSuccess = IResponse<MuscleGroupListItem[]>
export type GetMuscleGroupListError = IResponse<null>

export type MuscleGroupError = IResponse<null>
