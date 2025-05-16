import { Typography } from 'antd'
import { timeToHms } from 'app/utils/time'
import { Dayjs } from 'dayjs'

export type DescriptionProps = {
  rounds: number
  round_break: number | Dayjs
  payloadDictionary: {
    time: {
      hour: {
        short: string
      },
      minute: {
        short: string
      },
      second: {
        short: string
      }
    }
  }
  workoutDictionary: {
    input_labels: {
      rounds: string
      round_break: string
      break: string
    }
  }
}

const Description = ({ rounds, round_break, payloadDictionary, workoutDictionary }: DescriptionProps) => (
  <div style={{ lineHeight: 1 }}>
    <Typography.Text>{workoutDictionary.input_labels.rounds}: {rounds}</Typography.Text>
    &nbsp;|&nbsp;
    <Typography.Text>{workoutDictionary.input_labels.round_break}: {round_break
      ? timeToHms(
        round_break,
        {
          hms: [
            payloadDictionary.time.hour.short,
            payloadDictionary.time.minute.short,
            payloadDictionary.time.second.short,
          ],
        },
      )
      : `0${payloadDictionary.time.second.short}`}</Typography.Text>
  </div>
)

export default Description