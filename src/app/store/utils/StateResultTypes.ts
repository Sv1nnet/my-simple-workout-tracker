import type { SerializedError } from '@reduxjs/toolkit'
import type { QueryStatus } from '@reduxjs/toolkit/dist/query'
 
export type StateResult<D, A> = {
  data: D
  error: SerializedError
  endpointName: string
  isError: false
  isFetching: true
  isLoading: true
  isSuccess: false
  isUninitialized: false
  originalArgs: A
  requestId: string
  startedTimeStamp: number
  status: QueryStatus
}

export type ListQuery = {
  page: number;
  byPage: number;
  searchValue: string;
}