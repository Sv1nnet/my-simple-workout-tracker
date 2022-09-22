import PropTypes from 'prop-types'
import GuestRoute from '../guest/GuestRoute'
import UserRoute from '../user/UserRoute'
import { NextPage } from 'next'
import { selectToken } from '@/src/app/store/slices/auth'
import { useAppSelector } from '@/src/app/hooks'
import respondAfterTimeoutInMs, { Timeout } from '@/src/app/utils/respondAfterTimeoutInMs'
import withAuth, { GetServerSidePropsContextWithSession } from '@/src/app/store/utils/withAuth'
import routes from '@/src/app/constants/end_points'
import handleJwtStatus from '@/src/app/utils/handleJwtStatus'

const AuthLayout: NextPage = ({ children, ...rest }) => {
  const token = useAppSelector(selectToken)
  return (
    token
      ? (
        <UserRoute>
          {children}
        </UserRoute>
      )
      : <GuestRoute />
  )
}
AuthLayout.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
}

export default AuthLayout
