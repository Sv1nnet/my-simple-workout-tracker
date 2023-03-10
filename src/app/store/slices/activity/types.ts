import { IResponse } from 'app/constants/response_types'
import { Dayjs } from 'dayjs'
import { WorkoutForm } from 'store/slices/workout/types'

export type Image = {
  uid: string,
  url: string,
  name: string,
}

export type Activity<T = string | Dayjs> = {
  id?: string;
  date: T,
  workout_id: Pick<WorkoutForm, 'id'>;
  results: {
    _id: string,
    hours?: boolean,
    original_id: string,
    id_in_workout: string,
    type: string,
    rounds: Round[],
    note?: string | null,
  }[];
  duration?: number;
  description: string | null;
}

export type ActivityForm<T = Dayjs> = Activity<T>

export interface IActivityFormData extends ActivityForm {}

export type ActivityCreateSuccess = IResponse<ActivityForm<string>>

export type ActivityUpdateSuccess = IResponse<ActivityForm<string>>

export type ActivityDeleteSuccess = IResponse<ActivityForm<string>[]>
export type ActivityDeleteError = IResponse<null>
export type EachSideRound<T = number | string | null | Dayjs> = { left: T, right: T }
export type Round<T = number | string | null | Dayjs> = number | string | Dayjs | EachSideRound<T>

export type GetActivitySuccess = IResponse<ActivityForm<string>>
export type GetActivityError = IResponse<null>

export type ActivityListItem = {
  date: string,
  description: string,
  id: string,
  results: {
    details: {
      repeats: number,
      weight: number,
      mass_unit: string,
    }
    exercise_title: string,
    hours: boolean,
    note?: string,
    id_in_workout: string,
    original_id: string,
    rounds: Round[],
    type: string,
    _id: string,
  }[],
  workout_id: Pick<WorkoutForm, 'id'>,
  workout_title: string,
}

export type ActivityListResponseSuccess = {
  total: number,
  list: ActivityListItem[],
}

export type GetActivityListSuccess = IResponse<ActivityListResponseSuccess>
export type GetActivityListError = IResponse<null>

export type HistoryResult = number | { left: number, right: number }

export type HistoryServerPayload<T = string> = {
  [type: string]: {
    items: {
      date: T,
      results: HistoryResult[]
    }[],
    total: 3,
  }
}

export type GetHistoryListSuccess = IResponse<HistoryServerPayload>
export type GetHistoryListError = IResponse<null>

export type ActivityError = IResponse

export type SelectedRoundPayload = {
  index: number | string | null,
  chartId: string,
}
