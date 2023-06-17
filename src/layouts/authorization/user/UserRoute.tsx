import { useEffect } from 'react'
import cookie from 'js-cookie'
import { MainTemplate } from '../../main'

const UserRoute = () => {
  useEffect(() => {
    cookie.remove('logout')
  }, [])

  return <MainTemplate />
}

export default UserRoute
