import { createContext, FC, useMemo } from 'react'
import _rawIntl from 'constants/intl.json'
import { useAppSelector } from 'app/hooks'
import { selectLang } from 'store/slices/config'
import { Lang } from 'store/slices/config/types'

export const IntlContext = createContext<{ intl: any, lang: Lang }>({ intl: {}, lang: 'eng' })
export type StringWithShort = String & { short?: string }

const IntlContextProvider: FC = ({ children }) => {
  const lang = useAppSelector(selectLang)
  const intl = useMemo(() => {
    let _lang = lang
    const { langs, ...rawIntl } = _rawIntl
    if (!_lang || !langs.includes(_lang)) _lang = 'eng'

    const getValueByLang = (obj: object & { short?: object }, l: string) => {
      if (l in obj) {
        const extraKeys = Object.keys(obj).filter(key => key !== 'ru' && key !== 'eng')
        let result: StringWithShort | string = obj[l]
        if (extraKeys.length) {
          result = Array.isArray(result) ? result : new String(result) as StringWithShort
          extraKeys.forEach((key) => {
            result[key] = getValueByLang(obj[key], _lang)
          })
        }
        return result
      }

      return Object
        .entries(obj)
        .reduce((acc, [ key, value ]) => {
          acc[key] = getValueByLang(value, l)
          return acc
        }, {})
    }

    const result = Object
      .entries(rawIntl)
      .reduce((acc, [ key, value ]) => {
        acc[key] = getValueByLang(value, _lang)
        return acc
      }, {})
    return result
  }, [ lang ])

  return <IntlContext.Provider value={{ intl, lang }}>{children}</IntlContext.Provider>
}

export default IntlContextProvider
