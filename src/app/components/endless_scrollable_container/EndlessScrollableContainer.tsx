import { FC, ReactNode, UIEvent, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { useDebouncedCallback } from '../../hooks'
import isFunc from 'app/utils/isFunc'

const Container = styled.div`
  height: 100%;
  overflow-y: scroll;
`

export interface IEndlessScrollableContainer {
  children: ReactNode;
  onScroll: (e: UIEvent<HTMLElement>) => void
  callOnMount?: boolean;
}

const EndlessScrollableContainer: FC<IEndlessScrollableContainer> = ({ children, callOnMount = false, onScroll, ...rest }) => {
  const $container = useRef<HTMLDivElement>(null)

  const handleEndlessScroll = useDebouncedCallback((e) => {
    if (isFunc(onScroll)) onScroll(e)
  }, 100)

  useEffect(() => {
    if (callOnMount) handleEndlessScroll({ target: $container.current })
  }, [])

  return (
    <Container ref={$container} onScroll={handleEndlessScroll} {...rest}>
      {children}
    </Container>
  )
}

export default EndlessScrollableContainer
