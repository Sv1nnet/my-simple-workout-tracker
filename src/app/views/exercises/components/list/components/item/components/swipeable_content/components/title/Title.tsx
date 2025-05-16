import { Typography } from 'antd'
import { LoadType, StyledTitle } from './components'
import getWordByNumber from 'app/utils/getWordByNumber'
import { timeToHms } from 'app/utils/time'
import { FC } from 'react'
import { Dayjs } from 'dayjs'

export interface ITitle {
  title: string
  repeats: number | string
  time: number | string | Dayjs
  weight: number | string
  massUnit: string
  payloadDictionary: Record<string, { [key: string]: any }>
}

const Title: FC<ITitle> = ({ title, repeats, time, weight, massUnit = 'kg', payloadDictionary }) => {
  repeats = repeats ? `${repeats} ${getWordByNumber(payloadDictionary.repeats.short, repeats)}` : null
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
  weight = weight ? `${weight} ${payloadDictionary.mass_unit[massUnit]?.[0]}` : null

  const loadTypeText = [ repeats, time, weight ].filter(Boolean).join(' / ')

  return (
    <div>
      <LoadType>
        {loadTypeText && <Typography.Text type="secondary">{loadTypeText}</Typography.Text>}
      </LoadType>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <StyledTitle level={4}>{title}</StyledTitle>
      </div>
    </div>
  )
}

export default Title