import { createContext, FC, useMemo } from 'react'
import _rawIntl from 'constants/intl.json'
import { useAppSelector } from 'app/hooks'
import { selectLang } from 'store/slices/config'

export const IntlContext = createContext<{ intl: any }>({ intl: {} })
export type StringWithShort = String & { short?: string }

const IntlContextProvider: FC = ({ children }) => {
  let lang = useAppSelector(selectLang)
  const intl = useMemo(() => {
    const { langs, ...rawIntl } = _rawIntl
    if (!lang || !langs.includes(lang)) lang = 'eng'

    const getValueByLang = (obj: object & { short?: object }, l: string) => {
      if (l in obj) {
        const extraKeys = Object.keys(obj).filter(key => key !== 'ru' && key !== 'eng')
        let result: StringWithShort | string = obj[l]
        if (extraKeys.length) {
          result = Array.isArray(result) ? result : new String(result) as StringWithShort
          extraKeys.forEach((key) => {
            result[key] = getValueByLang(obj[key], lang)
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
        acc[key] = getValueByLang(value, lang)
        return acc
      }, {})
    return result
  }, [ lang ])

  return <IntlContext.Provider value={{ intl }}>{children}</IntlContext.Provider>
}

export default IntlContextProvider
