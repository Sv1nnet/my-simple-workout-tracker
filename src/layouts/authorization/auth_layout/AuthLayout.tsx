import GuestRoute from '../guest/GuestRoute'
import UserRoute from '../user/UserRoute'
import { selectIsNoAuthLogin, selectToken } from 'app/store/slices/auth'
import { useAppSelector } from 'app/hooks'

const AuthLayout = () => {
  const isNoAuthLogin = useAppSelector(selectIsNoAuthLogin)
  const token = useAppSelector(selectToken)
  
  return (
    isNoAuthLogin || token
      ? <UserRoute />
      : <GuestRoute />
  )
}

export default AuthLayout
