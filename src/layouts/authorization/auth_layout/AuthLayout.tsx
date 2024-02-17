import GuestRoute from '../guest/GuestRoute'
import UserRoute from '../user/UserRoute'
import { selectIsNoCredsLogin, selectToken } from 'app/store/slices/auth'
import { useAppSelector } from 'app/hooks'

const AuthLayout = () => {
  const isNoCredsLogin = useAppSelector(selectIsNoCredsLogin)
  const token = useAppSelector(selectToken)
  
  return (
    isNoCredsLogin || token
      ? <UserRoute />
      : <GuestRoute />
  )
}

export default AuthLayout
