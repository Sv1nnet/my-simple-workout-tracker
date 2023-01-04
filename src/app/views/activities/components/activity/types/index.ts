import { ActivityForm } from '@/src/app/store/slices/activity/types'
import { WorkoutForm } from '@/src/app/store/slices/workout/types'
import { Dayjs } from 'dayjs'

export interface IActivityProps {
  id?: string;
  isEdit?: boolean;
  isFetching?: boolean;
  initialValues?: InitialValues<string>;
  isError: boolean;
  error?: string;
  errorCode?: number;
  errorAppCode?: number;
  deleteActivity?: Function;
  onSubmit: Function;
}

export type InitialValues<T = Dayjs> = Omit<ActivityForm<T>, '_id' | 'workout_id'> & {
  _id?: string,
  workout_id?: Pick<WorkoutForm, 'id'>,
}
