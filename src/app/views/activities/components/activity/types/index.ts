import { QueryStatus } from '@reduxjs/toolkit/dist/query'
import { ActivityForm } from 'app/store/slices/activity/types'
import { WorkoutForm } from 'app/store/slices/workout/types'
import { Dayjs } from 'dayjs'

export interface IActivityProps {
  id?: string;
  isEdit?: boolean;
  isFetching?: boolean;
  initialValues?: InitialValues<string>;
  isError: boolean;
  deleteStatus?: QueryStatus;
  error?: string;
  errorCode?: number;
  errorAppCode?: number;
  deleteActivity?: Function;
  onSubmit: Function;
}

export type InitialValues<T = Dayjs> = Omit<ActivityForm<T>, '_id' | 'workout_id'> & {
  _id?: string,
  workout_id?: WorkoutForm['id'],
}

export type CacheFormData = (changedValue: string[], values: InitialValues) => void
