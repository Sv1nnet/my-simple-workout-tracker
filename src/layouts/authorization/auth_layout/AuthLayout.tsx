import GuestRoute from '../guest/GuestRoute'
import UserRoute from '../user/UserRoute'
import { selectToken } from 'app/store/slices/auth'
import { useAppSelector } from 'app/hooks'

const AuthLayout = () => {
  const token = useAppSelector(selectToken)
  
  return (
    token
      ? (
        <UserRoute />
      )
      : <GuestRoute />
  )
}

export default AuthLayout
