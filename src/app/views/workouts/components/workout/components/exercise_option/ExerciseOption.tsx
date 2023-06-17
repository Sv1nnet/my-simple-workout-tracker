import styled from 'styled-components'
import { Typography } from 'antd'
import getWordByNumber from 'app/utils/getWordByNumber'
import { timeToHms } from 'app/utils/time'
import { Dayjs } from 'dayjs'
import { FC } from 'react'

const OptionContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  height: 100%;
  align-items: center;
  .ant-typography-secondary {
    font-size: 14px;
  }
`

export interface IExerciseOption {
  title: string;
  repeats?: number | string;
  payloadDictionary: {
    repeats: {
      short: string[]
    },
    time: {
      hour: { short: string },
      minute: { short: string },
      second: { short: string },
    },
    mass_unit: {
      [key: string]: string,
    },
  };
  time?: string | number | Dayjs;
  weight?: string | number;
  mass_unit?: string;
}

const ExerciseOption: FC<IExerciseOption> = ({ title, repeats, payloadDictionary, time, weight, mass_unit }) => {
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
  weight = weight ? `${weight} ${payloadDictionary.mass_unit[mass_unit][0]}` : null

  const text = [ repeats, time, weight ].filter(Boolean).join(' / ')
  return (
    <OptionContainer>
      <Typography.Title level={5} style={{ width: '100%', margin: 0, lineHeight: 1 }}>{title}</Typography.Title>
      {text && <Typography.Text type="secondary" style={{ display: 'block', lineHeight: 1 }}>{text}</Typography.Text>}
    </OptionContainer>
  )
}

export default ExerciseOption
