import { createContext, forwardRef, MouseEvent, useContext, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { isNullish } from 'utility-types'
import { isFunction } from 'app/utils/typeCheckers'
import { useIsScrolling, useOnPreviousChange } from 'app/hooks'
import numInRange from 'app/utils/numInRange'

export enum SwipeableDirection {
  NONE = 'none',
  LEFT = 'left',
  RIGHT = 'right',
  BOTH = 'both',
}

const SwipeableContext = createContext<{
  isSwiping: boolean
  delta: number
  pointerPos: number
  startPos: number
  isOnMaxDistance: boolean
  direction: SwipeableDirection
}>({
  isSwiping: false,
  delta: 0,
  pointerPos: 0,
  startPos: 0,
  isOnMaxDistance: false,
  direction: SwipeableDirection.NONE,
})

export interface SwipeableRef {
  reset: () => void
}

const TOUCH_MOVE_COUNT_THRESHOLD = 2

export type SwipeableProps = {
  children: React.ReactNode | ((props: { isSwiping: boolean, delta: number, pointerPos: number, startPos: number, isOnMaxDistance: boolean, direction: SwipeableDirection }) => React.ReactNode)
  direction: SwipeableDirection
  isDisabled?: boolean
  style?: React.CSSProperties
  moveToInitialTimingFunction?: string
  moveToInitialDuration?: number
  moveToInitialOnRelease?: boolean
  moveToInitialOnMaxRelease?: boolean
  isAnimatedMoveToInitial?: boolean
  gap?: number
  onMaxDistance?: (
    {
      isOnMaxDistance,
      direction,
      pointerPos,
      delta,
    }: { isOnMaxDistance: boolean, direction: SwipeableDirection, pointerPos: number, delta: number },
    event: React.TouchEvent<HTMLDivElement>
  ) => void
  onReset?: (event: TransitionEvent) => void
  onRelease?: (
    {
      isOnMaxDistance,
      direction,
      pointerPos,
      delta,
    }: { isOnMaxDistance: boolean, direction: SwipeableDirection, pointerPos: number, delta: number },
    event: React.TouchEvent<HTMLDivElement>
  ) => void
  onStart?: (event: React.TouchEvent<HTMLDivElement>) => void
  onMove?: (event: React.TouchEvent<HTMLDivElement>) => void
  maxDistance?: number
  maxDistanceLeft?: number
  maxDistanceRight?: number
  scrollableContainer?: HTMLElement | null
}

const Swipeable = forwardRef<SwipeableRef, SwipeableProps>(function Swipeable({
  children,
  maxDistance,
  maxDistanceLeft = maxDistance,
  maxDistanceRight = maxDistance,
  direction = SwipeableDirection.BOTH,
  moveToInitialOnRelease = true,
  moveToInitialOnMaxRelease = true,
  isAnimatedMoveToInitial = true,
  moveToInitialTimingFunction = 'ease-in-out',
  moveToInitialDuration = 0.25,
  gap = 30,
  style,
  isDisabled = false,
  onMaxDistance,
  onReset,
  onRelease,
  onStart,
  onMove,
  scrollableContainer,
}, ref) {
  if (!isNullish(maxDistance)) {
    maxDistance = Math.abs(maxDistance)
  }

  if (!isNullish(maxDistanceLeft)) {
    maxDistanceLeft = Math.abs(maxDistanceLeft)
  }

  if (!isNullish(maxDistanceRight)) {
    maxDistanceRight = Math.abs(maxDistanceRight)
  }

  const [ isSwipeAllowed, setIsSwipeAllowed ] = useState(!isDisabled || direction === SwipeableDirection.NONE)
  const [ isSwiping, setIsSwiping ] = useState(false)

  const [ isOnMaxDistance, setIsOnMaxDistance ] = useState(false)
  const [ currentDirection, setCurrentDirection ] = useState(SwipeableDirection.NONE)

  const [ currentGap, setCurrentGap ] = useState(0)
  const [ startPos, setStartPos ] = useState(0)
  const [ pointerPos, setPointerPos ] = useState(0)
  const [ prevPointerPos, setPrevPointerPos ] = useState(0)
  const [ delta, setDelta ] = useState(0)
  const [ deltaY, setDeltaY ] = useState(0)

  // Used to count the number of touch move events.
  // It's needed to prevent the swipe from being triggered while container is scrolling.
  const touchMoveCountRef = useRef(0)

  const $swipeable = useRef<HTMLDivElement>(null)

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!isSwipeAllowed || isDisabled) return

    setDelta(-($swipeable.current?.getBoundingClientRect().left ?? 0))

    // setIsSwiping(true)
    setStartPos(event.touches[0].clientX)
    setDeltaY(event.touches[0].clientY)

    // if user put pointer before item got back to initial position after touch end
    if (currentDirection !== SwipeableDirection.NONE) {
      setIsSwiping(true)
      setPrevPointerPos(event.touches[0].clientX)
      touchMoveCountRef.current = TOUCH_MOVE_COUNT_THRESHOLD
    }
    
    onStart?.(event)
  }

  const resetAll = () => {
    touchMoveCountRef.current = 0
    setCurrentGap(0)
    setDelta(0)
    setDeltaY(0)
    setIsOnMaxDistance(false)
    setCurrentDirection(SwipeableDirection.NONE)
    setPrevPointerPos(0)
    setIsSwiping(false)
    setPointerPos(0)
    setStartPos(0)
  }

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!isSwipeAllowed || isDisabled) return

    touchMoveCountRef.current++
    
    if (touchMoveCountRef.current < TOUCH_MOVE_COUNT_THRESHOLD || !isSwipeAllowed || event.touches.length > 1) return

    setIsSwiping(true)

    const touch = event.touches[0]
    const currentPointerPos = touch.clientX
    const step = currentPointerPos - prevPointerPos

    const _delta = !currentGap
      ? currentDirection === SwipeableDirection.NONE
        ? startPos - currentPointerPos
        : delta - step
      : delta

    const _currentDirection = _delta > 0 ? SwipeableDirection.LEFT : _delta < 0 ? SwipeableDirection.RIGHT : SwipeableDirection.NONE
    const isAllowedDirection = direction !== SwipeableDirection.NONE && (direction === SwipeableDirection.BOTH || direction === _currentDirection)
    
    const _maxDistance = _currentDirection === SwipeableDirection.LEFT ? maxDistanceLeft : _currentDirection === SwipeableDirection.RIGHT ? maxDistanceRight : maxDistance
    const deltaToGetGap = Math.abs(currentDirection === SwipeableDirection.NONE ? startPos - currentPointerPos : _delta - step)
    const _currentGap = numInRange(currentGap + (deltaToGetGap > _maxDistance ? deltaToGetGap - _maxDistance : -(_maxDistance - deltaToGetGap)), [ 0, gap ])

    if (isAllowedDirection) {
      setDeltaY(deltaY - touch.clientY)
      setPointerPos(currentPointerPos)
      setPrevPointerPos(currentPointerPos)
      setCurrentGap(_currentGap)
      
      setCurrentDirection(_currentDirection)

      // if is not on max distance after this move
      if (isNullish(_maxDistance) || (!_currentGap && Math.abs(_delta) <= _maxDistance)) {
        setDelta(_delta)
        setIsOnMaxDistance(false)
        
        if (isOnMaxDistance) {
          onMaxDistance?.({
            isOnMaxDistance: false,
            direction: _currentDirection,
            pointerPos: touch.clientX,
            delta: Math.abs(_delta),
          }, event)
        }
      } else if (_delta !== 0) {
        setIsOnMaxDistance(true)
        setDelta(_currentDirection === SwipeableDirection.LEFT ? _maxDistance : -_maxDistance)

        if (!isOnMaxDistance) {
          onMaxDistance?.({
            isOnMaxDistance: true,
            direction: _currentDirection,
            pointerPos: touch.clientX,
            delta: _maxDistance,
          }, event)
        }
      }
    } else {
      setStartPos(touch.clientX)
      setPointerPos(currentPointerPos)
      setPrevPointerPos(currentPointerPos)

      if (isOnMaxDistance) {
        resetAll()

        onMaxDistance?.({
          isOnMaxDistance: false,
          direction: SwipeableDirection.NONE,
          pointerPos: touch.clientX,
          delta: 0,
        }, event)
      }
    }

    if (_delta === 0) setCurrentDirection(SwipeableDirection.NONE)

    onMove?.(event)
  }

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    touchMoveCountRef.current = 0

    if (!isSwipeAllowed || isDisabled) return
    setIsSwiping(false)
    setIsOnMaxDistance(false)

    if ((isOnMaxDistance && moveToInitialOnMaxRelease) || (!isOnMaxDistance && moveToInitialOnRelease)) {
      setCurrentGap(0)
      setStartPos(0)
      setPointerPos(0)
      setPrevPointerPos(0)
      setDelta(0)
      setDeltaY(0)
    }

    onRelease?.({ isOnMaxDistance, direction: currentDirection, pointerPos, delta }, event)
  }

  const handleContextMenu = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    window.getSelection().removeAllRanges()
  }

  useOnPreviousChange(() => {
    if (isSwiping && Math.abs(delta) > maxDistance) {
      setIsOnMaxDistance(true)
      setDelta(maxDistance)
    }
  }, [ maxDistance ])

  useOnPreviousChange(() => {
    const isAllowedDirection = !isDisabled && direction !== SwipeableDirection.NONE && (direction === SwipeableDirection.BOTH || direction === currentDirection)
    if (isSwiping && !isAllowedDirection) {
      setIsOnMaxDistance(false)
      setDelta(0)
      setCurrentDirection(SwipeableDirection.NONE)
      setPrevPointerPos(0)
    }
  }, [ direction, isDisabled ])

  useOnPreviousChange(() => {
    if (!isSwipeAllowed || isDisabled) {
      resetAll()
    }
  }, [ isSwipeAllowed, isDisabled ])

  useIsScrolling(scrollableContainer, {
    isBoundedToPointer: true,
    msToSetNotScrolling: 100,
    onScrollStart: () => setIsSwipeAllowed(false),
    onScrollEnd: () => setIsSwipeAllowed(true),
  })

  useImperativeHandle(ref, () => ({
    reset: () => resetAll(),
  }))

  useEffect(() => {
    if ($swipeable.current) {
      const handleTransitionEnd = (e: TransitionEvent) => {
        if (e.propertyName === 'transform') {
          onReset?.(e)
          setCurrentDirection(SwipeableDirection.NONE)
        }
      }
      $swipeable.current.addEventListener('transitionend', handleTransitionEnd)

      return () => {
        $swipeable.current?.removeEventListener('transitionend', handleTransitionEnd)
      }
    }
  }, [])

  const value = useMemo(() => ({
    isDisabled,
    isSwiping,
    delta,
    pointerPos,
    startPos,
    isOnMaxDistance,
    direction: currentDirection,
  }), [ isSwiping, delta, pointerPos, startPos, isOnMaxDistance, isDisabled ])

  return (
    <SwipeableContext.Provider value={value}>
      <div
        ref={$swipeable}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onContextMenu={!isDisabled && (isSwiping || currentDirection !== SwipeableDirection.NONE) ? handleContextMenu : undefined}
        style={{
          ...style,
          transition: !isSwiping && isAnimatedMoveToInitial ? `transform ${moveToInitialDuration}s ${moveToInitialTimingFunction}` : 'none',
          transform: `translateX(${-delta}px)`,
        }}
      >
        {isFunction(children) ? children({ isSwiping, delta, pointerPos, startPos, isOnMaxDistance, direction: currentDirection }) : children}
      </div>
    </SwipeableContext.Provider>
  )
})

export default Swipeable

export const useSwipeableContext = () => {
  const context = useContext(SwipeableContext)
  if (!context) {
    throw new Error('useSwipeableContext must be used within a SwipeableContext.Provider')
  }
  return context
}
