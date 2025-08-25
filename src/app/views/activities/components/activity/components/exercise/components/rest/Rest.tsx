import { Typography } from 'antd'
import { Timers } from './components'

export type RestProps = {
  id: string
  details: any
  timer: any
  rounds: number
  round_break: number
  side_labels: any
}

const Rest = ({ id, details, timer, rounds, round_break, side_labels }: RestProps) => (
  <div>
    <Typography.Text>
      Отдых:
    </Typography.Text>
    <Timers
      id={id}
      eachSide={details.each_side}
      timerDictionary={timer}
      totalRounds={rounds}
      durationInSeconds={round_break}
      sideLabels={side_labels}
    />
  </div>
)

export default Rest