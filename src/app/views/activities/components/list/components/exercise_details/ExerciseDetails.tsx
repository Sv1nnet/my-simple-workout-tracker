import { FC } from 'react'
import styled from 'styled-components'
import { timeToHms } from 'app/utils/time'
import { ExerciseResultsDetails } from 'pages/activities/List'
import getWordByNumber from 'app/utils/getWordByNumber'
import { Typography } from 'antd'

const { Text } = Typography

const LoadType = styled.div`
width: 100%;
text-align: left;
line-height: 1;
`

export type ExerciseDetailsProps = ExerciseResultsDetails & {
  payloadDictionary: any;
}

const ExerciseDetails: FC<ExerciseDetailsProps> = ({ repeats, time, weight, mass_unit, payloadDictionary }) => {
  const _repeats = repeats ? `${repeats} ${getWordByNumber(payloadDictionary.repeats.short, repeats)}` : null
  const _time = time
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
  const _weight = weight ? `${weight} ${payloadDictionary.mass_unit[mass_unit][0]}` : null
  return (
    <LoadType>
      <Text type="secondary">{[ _repeats, _time, _weight ].filter(Boolean).join(' / ') || <span />}</Text>
    </LoadType>
  )
}

export default ExerciseDetails
