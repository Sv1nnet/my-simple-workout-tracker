import { FC, useEffect, useRef, useState } from 'react'
import { isNullish } from 'utility-types'
import { isFunction } from '../../utils/typeCheckers'
import { useIsScrolling, useOnPreviousChange } from 'app/hooks'
import numInRange from 'app/utils/numInRange'

export enum SwipableDirection {
  NONE = 'none',
  LEFT = 'left',
  RIGHT = 'right',
  BOTH = 'both',
}

export type SwipableProps = {
  children: React.ReactNode | ((props: { isSwiping: boolean, delta: number, pointerPos: number, startPos: number, isOnMaxDistance: boolean, direction: SwipableDirection }) => React.ReactNode)
  direction: SwipableDirection
  disabled?: boolean
  style?: React.CSSProperties
  moveToInitialTimingFunction?: string
  moveToInitialDuration?: number
  moveToInitialOnRelease?: boolean
  isAnimatedMoveToInitial?: boolean
  gap?: number
  onMaxDistance?: (
    {
      isOnMaxDistance,
      direction,
      pointerPos,
      delta,
    }: { isOnMaxDistance: boolean, direction: SwipableDirection, pointerPos: number, delta: number },
    event: React.TouchEvent<HTMLDivElement>
  ) => void
  onReset?: (event: TransitionEvent) => void
  onRelease?: (
    {
      isOnMaxDistance,
      direction,
      pointerPos,
      delta,
    }: { isOnMaxDistance: boolean, direction: SwipableDirection, pointerPos: number, delta: number },
    event: React.TouchEvent<HTMLDivElement>
  ) => void
  onStart?: (event: React.TouchEvent<HTMLDivElement>) => void
  onMove?: (event: React.TouchEvent<HTMLDivElement>) => void
  maxDistance?: number
  maxDistanceLeft?: number
  maxDistanceRight?: number
  scrollableContainer?: HTMLElement | null
}

const Swipable: FC<SwipableProps> = ({
  children,
  maxDistance,
  maxDistanceLeft = maxDistance,
  maxDistanceRight = maxDistance,
  direction = SwipableDirection.BOTH,
  moveToInitialOnRelease = true,
  isAnimatedMoveToInitial = true,
  moveToInitialTimingFunction = 'ease-in-out',
  moveToInitialDuration = 0.25,
  gap = 30,
  style,
  disabled = false,
  onMaxDistance,
  onReset,
  onRelease,
  onStart,
  onMove,
  scrollableContainer,
}) => {
  if (!isNullish(maxDistance)) {
    maxDistance = Math.abs(maxDistance)
  }

  if (!isNullish(maxDistanceLeft)) {
    maxDistanceLeft = Math.abs(maxDistanceLeft)
  }

  if (!isNullish(maxDistanceRight)) {
    maxDistanceRight = Math.abs(maxDistanceRight)
  }

  const [ isSwipeAllowed, setIsSwipeAllowed ] = useState(!disabled)
  const [ isSwiping, setIsSwiping ] = useState(false)

  const [ isOnMaxDistance, setIsOnMaxDistance ] = useState(false)
  const [ currentDirection, setCurrentDirection ] = useState(SwipableDirection.NONE)

  const [ currentGap, setCurrentGap ] = useState(0)
  const [ startPos, setStartPos ] = useState(0)
  const [ pointerPos, setPointerPos ] = useState(0)
  const [ prevPointerPos, setPrevPointerPos ] = useState(0)
  const [ delta, setDelta ] = useState(0)
  const [ deltaY, setDeltaY ] = useState(0)

  const $swipable = useRef<HTMLDivElement>(null)

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!isSwipeAllowed) return

    setIsSwiping(true)
    setStartPos(event.touches[0].clientX)
    setDeltaY(event.touches[0].clientY)
    onStart?.(event)
  }

  const resetAll = () => {
    setCurrentGap(0)
    setDelta(0)
    setDeltaY(0)
    setIsOnMaxDistance(false)
    setCurrentDirection(SwipableDirection.NONE)
    setPrevPointerPos(0)
    setIsSwiping(false)
    setPointerPos(0)
    setStartPos(0)
  }

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!isSwipeAllowed || event.touches.length > 1) return

    const touch = event.touches[0]
    const currentPointerPos = touch.clientX
    const step = currentPointerPos - prevPointerPos

    const _delta = !currentGap
      ? currentDirection === SwipableDirection.NONE
        ? startPos - currentPointerPos
        : delta - step
      : delta

    const _currentDirection = _delta > 0 ? SwipableDirection.LEFT : _delta < 0 ? SwipableDirection.RIGHT : SwipableDirection.NONE
    const isAllowedDirection = direction !== SwipableDirection.NONE && (direction === SwipableDirection.BOTH || direction === _currentDirection)
    
    const _maxDistance = _currentDirection === SwipableDirection.LEFT ? maxDistanceLeft : _currentDirection === SwipableDirection.RIGHT ? maxDistanceRight : maxDistance
    const deltaToGetGap = Math.abs(currentDirection === SwipableDirection.NONE ? startPos - currentPointerPos : _delta - step)
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
        setDelta(_currentDirection === SwipableDirection.LEFT ? _maxDistance : -_maxDistance)

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
          direction: SwipableDirection.NONE,
          pointerPos: touch.clientX,
          delta: 0,
        }, event)
      }
    }

    if (_delta === 0) setCurrentDirection(SwipableDirection.NONE)

    onMove?.(event)
  }

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!isSwipeAllowed) return
    setIsSwiping(false)
    setIsOnMaxDistance(false)

    if (moveToInitialOnRelease) {
      setCurrentGap(0)
      setStartPos(0)
      setPointerPos(0)
      setPrevPointerPos(0)
      setDelta(0)
      setDeltaY(0)
    }
    onRelease?.({ isOnMaxDistance, direction: currentDirection, pointerPos, delta }, event)
  }  

  useOnPreviousChange(() => {
    if (isSwiping && Math.abs(delta) > maxDistance) {
      setIsOnMaxDistance(true)
      setDelta(maxDistance)
    }
  }, [ maxDistance ])

  useOnPreviousChange(() => {
    const isAllowedDirection = direction !== SwipableDirection.NONE && (direction === SwipableDirection.BOTH || direction === currentDirection)
    if (isSwiping && !isAllowedDirection) {
      setIsOnMaxDistance(false)
      setDelta(0)
      setCurrentDirection(SwipableDirection.NONE)
      setPrevPointerPos(0)
    }
  }, [ direction ])

  useOnPreviousChange(() => {
    if (!isSwipeAllowed) {
      resetAll()
    }
  }, [ isSwipeAllowed ])

  useIsScrolling(scrollableContainer, {
    isBoundedToPointer: true,
    msToSetNotScrolling: 100,
    onScrollStart: () => setIsSwipeAllowed(false),
    onScrollEnd: () => setIsSwipeAllowed(true),
  })

  useEffect(() => {
    if ($swipable.current) {
      const handleTransitionEnd = (e: TransitionEvent) => {
        if (e.propertyName === 'transform') {
          onReset?.(e)
          setCurrentDirection(SwipableDirection.NONE)
        }
      }
      $swipable.current.addEventListener('transitionend', handleTransitionEnd)

      return () => {
        $swipable.current?.removeEventListener('transitionend', handleTransitionEnd)
      }
    }
  }, [])

  return (
    <div
      ref={$swipable}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        ...style,
        transition: !isSwiping && isAnimatedMoveToInitial ? `transform ${moveToInitialDuration}s ${moveToInitialTimingFunction}` : 'none',
        transform: `translateX(${-delta}px)`,
      }}
    >
      {isFunction(children) ? children({ isSwiping, delta, pointerPos, startPos, isOnMaxDistance, direction: currentDirection }) : children}
    </div>
  )
}

export default Swipable
