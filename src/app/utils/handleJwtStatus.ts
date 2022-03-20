import { GetServerSideProps } from 'next'
import { GetServerSidePropsWithAuth } from 'store/utils/withAuth'
import { IResponse } from '../constants/response_types'

// eslint-disable-next-line no-unused-vars
export type GetServerSidePropsCb = <R = IResponse>(response?: R) => Awaited<ReturnType<GetServerSidePropsWithAuth | GetServerSideProps>>

export type ResponseWithMessage = { message?: string }

const handleJwtStatus = <T = any>(response: ResponseWithMessage | T, cb: GetServerSidePropsCb) => {
  if ((response as ResponseWithMessage)?.message === 'jwt expired') {
    return {
      shouldRefresh: true,
      props: {},
    }
  } else if ((response as ResponseWithMessage)?.message === 'jwt malformed') {
    return {
      shouldRefresh: false,
      props: {
        token: null,
      },
    }
  }
  return cb(response)
}

export default handleJwtStatus
