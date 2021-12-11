import { FC, useEffect } from 'react'
import { authApi } from '@/src/app/store/slices/auth/api'
import Cookie from 'js-cookie'
import React from 'react'

const UserRoute: FC = ({ children }) => {
  const [ logout ] = authApi.useLazyLogoutQuery()
  const onClick = () => {
    logout()
  }

  useEffect(() => {
    Cookie.remove('logout')
  }, [])

  return (
    <>
      {children}
      <button onClick={onClick}>Logout</button>
    </>
  )
}

export default UserRoute
