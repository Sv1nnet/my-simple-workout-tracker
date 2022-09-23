export type ApiInitial = 'initial'
export type ApiLoading = 'loading'
export type ApiLoaded = 'loaded'
export type ApiError = 'error'

export type ApiStatus = ApiInitial | ApiLoading | ApiLoaded | ApiError
export type ApiStatusKeys = 'INITIAL' | 'LOADING' | 'LOADED' | 'ERROR'

export const API_STATUS: { [key in ApiStatusKeys]: ApiStatus } = {
  INITIAL: 'initial',
  LOADING: 'loading',
  LOADED: 'loaded',
  ERROR: 'error',
}
