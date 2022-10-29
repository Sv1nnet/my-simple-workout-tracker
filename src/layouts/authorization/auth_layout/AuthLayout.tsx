import PropTypes from 'prop-types'
import GuestRoute from '../guest/GuestRoute'
import UserRoute from '../user/UserRoute'
import { NextPage } from 'next'
import { selectToken } from '@/src/app/store/slices/auth'
import { useAppSelector } from '@/src/app/hooks'

const AuthLayout: NextPage = ({ children }) => {
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
