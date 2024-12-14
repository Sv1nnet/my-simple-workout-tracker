import { Typography } from 'antd'
import getWordByNumber from 'app/utils/getWordByNumber'
import { timeToHms } from 'app/utils/time'
import { Dayjs } from 'dayjs'
import styled from 'styled-components'

const LoadType = styled.div`
  text-align: left;
  width: 100%;
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
  weight = weight ? `${weight} ${payloadDictionary.mass_unit[massUnit][0]}` : null

  return (
    <div>
      <LoadType>
        <Typography.Text type="secondary">{[ repeats, time, weight ].filter(Boolean).join(' / ') || <span>&nbsp;</span>}</Typography.Text>
      </LoadType>
      <Typography.Title style={{ marginBottom: '0' }} level={4}>{title}</Typography.Title>
    </div>
  )
}

export default Title
