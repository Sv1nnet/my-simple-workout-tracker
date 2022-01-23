import { FC, useEffect } from 'react'
import Cookie from 'js-cookie'
import React from 'react'

const UserRoute: FC = ({ children }) => {
  useEffect(() => {
    Cookie.remove('logout')
  }, [])

  return (
    <>
      {children}
    </>
  )
}

export default UserRoute
