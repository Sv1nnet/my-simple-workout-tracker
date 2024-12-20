import { initBaseData } from './initBaseData'

import browserDBLoader from 'store/utils/BrowserDB/browserDB.loader'
import noAuthHandlersLoader from 'store/utils/noAuthHandlers/noAuthHandlers.loader'

export const initLocalDB = async ({
  onAfterInit,
  onError,
  lang,
}: {
  onAfterInit?: () => void
  onError?: (error: Error) => void
  lang: 'ru' | 'eng'
}) => {
  const db = await browserDBLoader.get()
  await db.droppingPromise
  await noAuthHandlersLoader.get()

  db.init(async () => {
    const isBaseDataInited = await db.db?.get(db.db.tables.config, 'isBaseDataInited')
    const configLang = await db.db?.get(db.db.tables.config, 'lang')

    if (!configLang || configLang !== lang) {
      await db.db.set(db.db.tables.config, 'lang', lang)
    }

    try {
      if (!isBaseDataInited) {
        await initBaseData(db.db, lang)
        await db.db.set(db.db.tables.config, 'isBaseDataInited', 'true')
      }
    } catch (error) {
      onError?.(error)
    }

    onAfterInit?.()
  })
}