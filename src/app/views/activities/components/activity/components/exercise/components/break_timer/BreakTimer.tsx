import { FC, useState } from 'react'
import { Typography } from 'antd'
import { timeToHms } from 'app/utils/time'
import { Timer } from 'app/components'

export interface IBreakTimer {
  isAllResultsFilled: boolean;
  isLastRestOver: boolean;
  exerciseBreak: number;
  workoutsDictionary: {
    input_labels: {
      break: string
    }
  };
  payloadDictionary: {
    time: {
      hour: {
        short: string,
      },
      minute: {
        short: string,
      },
      second: {
        short: string,
      }
    }
  };
}

const BreakTimer: FC<IBreakTimer> = ({ isAllResultsFilled, exerciseBreak, workoutsDictionary, payloadDictionary, isLastRestOver }) => {
  const [ isBreakOver, setIsBreakOver ] = useState(false)
  const [ isBreakTimerVisible, setIsBreakTimerVisible ] = useState(true)

  const handleBreakOver = () => setIsBreakOver(true)
  const handleBreakReset = () => isBreakOver && setIsBreakTimerVisible(false)

  return (
    <div style={{ marginTop: '10px' }}>
      <Typography.Text style={{ display: 'block' }}>
        {workoutsDictionary.input_labels.break}: {timeToHms(exerciseBreak, {
          hms: [
            payloadDictionary.time.hour.short,
            payloadDictionary.time.minute.short,
            payloadDictionary.time.second.short,
          ],
        })}
      </Typography.Text>
      {isBreakTimerVisible && (isAllResultsFilled || isLastRestOver) && (
        <Timer
          resetButton
          duration={exerciseBreak * 1000}
          onTimeOver={handleBreakOver}
          onReset={handleBreakReset}
        />
      )}
    </div>
  )
}

export default BreakTimer
