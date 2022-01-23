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
        const result: StringWithShort = new String(obj[l]) as StringWithShort
        if (typeof obj.short === 'object' && obj.short !== null) {
          result.short = obj.short[l]
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
