import { useEffect } from 'react'
import cookie from 'js-cookie'
import { MainTemplate } from '../../main'
import browserDBLoader from 'app/store/utils/BrowserDB/browserDB.loader'
import { useAppLoaderContext } from 'app/contexts/loader/AppLoaderContextProvider'
import { initLocalDB } from 'app/utils/initLocalDB'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { notification } from 'antd'

let mounted = false

const UserRoute = () => {
  const { intl, lang } = useIntlContext()
  const { runLoader, stopLoaderById } = useAppLoaderContext()

  useEffect(() => {
    cookie.remove('logout')
  }, [])

  useEffect(() => {
    if (mounted) return

    const initBD = () => {
      runLoader('initNoAuthDB', { containerProps: { style: { top: 0 } } })

      initLocalDB({
        onAfterInit: () => {
          stopLoaderById('initNoAuthDB')
        },
        onError: (error) => {
          console.error(error)
          notification.error({
            message: intl.common.error,
            description: intl.rest.base_data_initialization.error,
          })
        },
        lang,
      })
    }

    (async () => {
      let isBaseDataInited = 'false'
      const db = await browserDBLoader.get()
      if (!db) {
        initBD()
      } else {
        isBaseDataInited = await db.db?.get(db.db.tables.config, 'isBaseDataInited')
        if (isBaseDataInited === 'false' || !isBaseDataInited) {
          initBD()
        }
      }
    })()

    mounted = true
  }, [])

  return <MainTemplate />
}

export default UserRoute
