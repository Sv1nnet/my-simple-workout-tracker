import styled from 'styled-components'
import { Typography } from 'antd'
import getWordByNumber from '@/src/app/utils/getWordByNumber'
import { timeToHms } from '@/src/app/utils/time'
import { Dayjs } from 'dayjs'
import { FC } from 'react'

const OptionContainer = styled.div`
  margin-top: 4px;
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

  return (
    <OptionContainer>
      <Typography.Title level={5} style={{ margin: 0, lineHeight: 1 }}>{title}</Typography.Title>
      <Typography.Text type="secondary" style={{ display: 'block', lineHeight: 1 }}>{[ repeats, time, weight ].filter(Boolean).join(' / ') || <span>&nbsp;</span>}</Typography.Text>
    </OptionContainer>
  )
}

export default ExerciseOption
