import { IResponse } from 'app/constants/response_types'
import { Dayjs } from 'dayjs'

export type Image = {
  uid: string,
  url: string,
  name: string,
}

export type Activity<T = number | Dayjs> = {
  id?: string;
  title: string;
  each_side: boolean;
  mass_unit: 'kg' | 'lb'
  type?: 'repeats' | 'time' | 'duration' | 'distance';
  time?: T;
  repeats?: number;
  weight?: string;
  description?: string;
  image?: Image;
}

export type ActivityForm = Omit<Activity, 'image'> & {
  image?: Image | Image[];
}

export type ActivityServerPayload = Omit<Activity<number>, 'image'> & {
  image?: Image;
}

export interface IActivityFormData extends ActivityForm, FormData {}

export type ActivityCreateSuccess = IResponse<ActivityServerPayload>

export type ActivityUpdateSuccess = IResponse<ActivityServerPayload>

export type ActivityDeleteSuccess = IResponse<ActivityServerPayload[]>
export type ActivityDeleteError = IResponse<null>

export type GetActivitySuccess = IResponse<ActivityForm>
export type GetActivityError = IResponse<null>

export type GetActivityListSuccess = IResponse<ActivityServerPayload[]>
export type GetActivityListError = IResponse<null>

export type ActivityError = IResponse
