import { FC, useState } from 'react'
import { Typography } from 'antd'
import { timeToHms } from 'app/utils/time'
import { Timer } from 'app/components'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'

export interface IBreakTimer {
  isAllResultsFilled: boolean;
  isLastRestOver: boolean;
  exerciseBreak: number;
  nextExerciseTitle: string;
  isEdit: boolean;
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

const BreakTimer: FC<IBreakTimer> = ({ isAllResultsFilled, isEdit, exerciseBreak, nextExerciseTitle, workoutsDictionary, payloadDictionary, isLastRestOver }) => {
  const { timer } = useIntlContext().intl.pages.activities
  const [ isBreakOver, setIsBreakOver ] = useState(false)
  const [ isBreakTimerVisible, setIsBreakTimerVisible ] = useState(!isEdit)

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
          notificationTitle={timer.break.title}
          notificationOptions={{
            tag: 'break_timer',
            body: nextExerciseTitle ? `${timer.break.message} ${nextExerciseTitle}.` : timer.break.workout_is_over,
            renotify: true,
          }}
          duration={exerciseBreak * 1000}
          onTimeOver={handleBreakOver}
          onReset={handleBreakReset}
        />
      )}
    </div>
  )
}

export default BreakTimer
