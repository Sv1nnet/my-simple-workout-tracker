import { Timer } from 'app/components'
import { SECONDS_IN_HOUR } from 'app/utils/time'
import { Container, EachSideContainer, SideLabel } from './components/styled'
import { useState } from 'react'
import { ITimer } from 'app/components/timer/Timer'
// import { AppNotificationData, AppNotificationOptions } from '@/src/app/components/timer/utils'

const DEFAULT_TIMER_ID = 'default_timer_id'

enum Side {
  NON_SIDE = 0,
  LEFT = -1,
  RIGHT = 1,
}

export type TimersProps = {
  id?: string
  eachSide?: boolean
  durationInSeconds?: number
  totalRounds?: number
  sideLabels?: { left: string, right: string }
  onTimeOver?: (...args: any[]) => void
  timerDictionary?: {
    round_break: { title: string, message: string, no_more_rounds: string }
    side: { left: string, right: string }
  }
}

const buttonProps: ITimer['buttonProps'] = {
  size: 'middle',
}

// type CurrentAppNotificationOptions = {
//   left: AppNotificationOptions
//   right: AppNotificationOptions
//   nonSide: AppNotificationOptions
// }

// const getDefaultAppNotificationOptions = (): CurrentAppNotificationOptions => ({
//   left: {},
//   right: {},
//   nonSide: {},
// })

const getSideIndex = (side: Side) => +!!side

const Timers = ({ id = DEFAULT_TIMER_ID, eachSide, durationInSeconds, totalRounds, sideLabels, onTimeOver, timerDictionary }: TimersProps) => {
  const [ currentRound, setCurrentRound ] = useState(() => eachSide ? [ 1, 1 ] : [ 1 ])
  const [ finishedRounds, setFinishedRounds ] = useState({})
  // const [ appNotificationOptions, setAppNotificationOptions ] = useState(getDefaultAppNotificationOptions)
  const [ webNotificationOptions, setWebNotificationOptions ] = useState({})

  const hoursOn = (durationInSeconds / SECONDS_IN_HOUR) >= 1
  const duration = durationInSeconds * 1000

  const handlePause = (side: Side) => () => {
    const roundIndex = getSideIndex(side)
    console.log('handleRun', side, roundIndex)
    // setAppNotificationOptions({
    //   running: {
    //     label: `${timerDictionary.round_break.title} (paused)`,
    //     body:  currentRound[roundIndex] < totalRounds
    //       ? `${timerDictionary.round_break.message} ${currentRound[roundIndex] + 1}.`
    //       : timerDictionary.round_break.no_more_rounds,
    //   },
    // })
    setWebNotificationOptions({
      tag: 'break_timer_left',
      body: currentRound[side] < totalRounds
        ? `${timerDictionary.round_break.message} ${currentRound[side] + 1}.`
        : timerDictionary.round_break.no_more_rounds,
      icon: '/manifest-icon-192.maskable.png',
    })
  }

  const handleRun = (side: Side) => () => {
    const roundIndex = getSideIndex(side)
    console.log('handleRun', side, roundIndex)
    // setAppNotificationOptions({
    //   running: {
    //     label: timerDictionary.round_break.title,
    //     body: currentRound[roundIndex] < totalRounds
    //       ? `${timerDictionary.round_break.message} ${currentRound[roundIndex] + 1}.`
    //       : timerDictionary.round_break.no_more_rounds,
    //   },
    // })
  }

  const handleTimeOver = (side: Side) => (...args) => {
    const roundIndex = getSideIndex(side)
    if (currentRound[roundIndex] < totalRounds) {
      const newFinishedRounds = eachSide
        ? {
          ...finishedRounds,
          [currentRound[roundIndex]]: {
            ...(finishedRounds[currentRound[roundIndex]] || {}),
            [side]: true,
          },
        }
        : {
          ...finishedRounds,
          [currentRound[getSideIndex(Side.NON_SIDE)]]: true,
        }
      setFinishedRounds(newFinishedRounds)
  
      if (eachSide) {
        if (newFinishedRounds[currentRound[roundIndex]]) {
          const newCurrentRound = [ ...currentRound ]
          newCurrentRound[roundIndex] += 1
          setCurrentRound(newCurrentRound)
        }
        onTimeOver?.(...args)
        return
      }

      if (newFinishedRounds[currentRound[getSideIndex(Side.NON_SIDE)]]) setCurrentRound([ currentRound[getSideIndex(Side.NON_SIDE)] + 1 ])
    }

    onTimeOver?.(...args)
  }

  return eachSide
    ? (
      <Container $eachSide>
        <EachSideContainer $right>
          <SideLabel type="secondary">{sideLabels.left}</SideLabel>
          <Timer
            resetButton
            id={`${id}_left`}
            onTimeOver={handleTimeOver(Side.LEFT)}
            notificationTitle={`(${timerDictionary.side.left}) ${timerDictionary.round_break.title}`}
            onPause={handlePause(Side.LEFT)}
            onRun={handleRun(Side.LEFT)}
            // appNotificationOptions={appNotificationOptions}
            webNotificationOptions={webNotificationOptions}
            hoursOn={hoursOn}
            duration={duration}
            buttonProps={buttonProps}
          />
        </EachSideContainer>
        <EachSideContainer $left>
          <SideLabel type="secondary">{sideLabels.right}</SideLabel>
          <Timer
            resetButton
            id={`${id}_right`}
            onTimeOver={handleTimeOver(Side.RIGHT)}
            notificationTitle={`(${timerDictionary.side.right}) ${timerDictionary.round_break.title}`}
            onPause={handlePause(Side.RIGHT)}
            onRun={handleRun(Side.RIGHT)}
            // appNotificationOptions={appNotificationOptions}
            webNotificationOptions={webNotificationOptions}
            hoursOn={hoursOn}
            duration={duration}
            buttonProps={buttonProps}
          />
        </EachSideContainer>
      </Container>
    )
    : (
      <Container>
        <Timer
          resetButton
          id={id}
          onTimeOver={handleTimeOver(Side.NON_SIDE)}
          notificationTitle={timerDictionary.round_break.title}
          onPause={handlePause(Side.NON_SIDE)}
          onRun={handleRun(Side.NON_SIDE)}
          // appNotificationOptions={appNotificationOptions}
          webNotificationOptions={webNotificationOptions}
          hoursOn={hoursOn}
          duration={duration}
          buttonProps={buttonProps}
        />
      </Container>
    )
}

export default Timers