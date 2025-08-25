import { FC } from 'react'
import { Typography } from 'antd'
import { Timer } from 'app/components'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'

export interface IBreakTimer {
  id?: string;
  exerciseBreak: number;
  nextExerciseTitle: string;
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

const BreakTimer: FC<IBreakTimer> = ({ id, exerciseBreak, nextExerciseTitle, workoutsDictionary }) => {
  const { timer } = useIntlContext().intl.pages.activities

  return (
    <div style={{ marginTop: '6px' }}>
      <Typography.Text style={{ display: 'block' }}>
        {workoutsDictionary.input_labels.break}:
      </Typography.Text>
      <Timer
        resetButton
        id={id}
        notificationTitle={timer.break.title}
        appNotificationOptions={{
          running: {
            label: timer.break.title,
            body: nextExerciseTitle ? `${timer.break.message} ${nextExerciseTitle}.` : timer.break.workout_is_over,
          },
          over: {
            label: timer.break.title,
            body: timer.break.workout_is_over,
          },
        }}
        webNotificationOptions={{
          tag: 'break_timer',
          body: nextExerciseTitle ? `${timer.break.message} ${nextExerciseTitle}.` : timer.break.workout_is_over,
          icon: '/manifest-icon-192.maskable.png',
        }}
        duration={exerciseBreak * 1000}
      />
    </div>
  )
}

export default BreakTimer
