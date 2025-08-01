import { Typography } from 'antd'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { useFixNumber } from 'app/hooks'
import getWordByNumber from 'app/utils/getWordByNumber'
import { timeToHms } from 'app/utils/time'
import { Dayjs } from 'dayjs'
import styled from 'styled-components'

const LoadType = styled.div`
  text-align: left;
  width: 100%;
  color: var(--text-color-secondary);
`

export type TitleProps = {
  title?: string
  repeats?: string | number | null
  time?: string | number | Dayjs | null
  weight?: string | number | null
  massUnit?: string
  payloadDictionary: any
}

const Title = ({ title, repeats, time, weight, massUnit = 'kg', payloadDictionary }: TitleProps) => {
  const fixNumber = useFixNumber({ cutZeroes: true })
  const { lang } = useIntlContext()
  repeats = repeats ? `${repeats} ${getWordByNumber(payloadDictionary.repeats.short, repeats, lang)}` : null
  time = time
    ? timeToHms(
      time,
      {
        hms: [
          payloadDictionary.time.hour.short,
          payloadDictionary.time.minute.short,
          payloadDictionary.time.second.short,
        ],
      },
    )
    : null
  weight = weight ? `${fixNumber((+weight).toFixed(2))} ${getWordByNumber(payloadDictionary.mass_unit[massUnit], weight, lang)}` : null

  const loadType = [ repeats, time, weight ].filter(Boolean).join(' / ')

  return (
    <div>
      {loadType && <LoadType>{loadType}</LoadType>}
      <Typography.Title style={{ marginBottom: '0' }} level={4}>{title}</Typography.Title>
    </div>
  )
}

export default Title
