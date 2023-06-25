import { ReactNode, UIEvent, forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import styled from 'styled-components'
import { useDebouncedCallback } from 'app/hooks'

const Container = styled.div`
  height: 100%;
  overflow-y: scroll;
`

export interface IEndlessScrollableContainer {
  children: ReactNode;
  onScroll?: (e: UIEvent<HTMLElement>) => void
  callOnMount?: boolean;
}

export type Ref = { $el: HTMLDivElement, scrollTo: (options: ScrollToOptions) => void, scrollTop: number | undefined }

const EndlessScrollableContainer = forwardRef<Ref, IEndlessScrollableContainer>(
  function EndlessScrollableContainer({ children, callOnMount = false, onScroll, ...rest }, ref) {
    const $container = useRef<HTMLDivElement>(null)
    const programmaticScrolledRef = useRef(false)

    const handleEndlessScroll = useDebouncedCallback((e) => {
      if (!programmaticScrolledRef.current) onScroll?.(e)
    }, 100)

    useImperativeHandle(ref, () => ({
      $el: $container.current,
      scrollTo: (options: ScrollToOptions = { left: 0, top: 0 }) => {
        programmaticScrolledRef.current = true
        $container.current?.scrollTo(options)
        programmaticScrolledRef.current = false
      },
      get scrollTop() {
        return $container.current?.scrollTop
      },
    }), [ $container.current, $container.current?.scrollTop ])

    useEffect(() => {
      if (callOnMount) handleEndlessScroll({ target: $container.current })
    }, [])

    return (
      <Container ref={$container} onScroll={handleEndlessScroll} {...rest}>
        {children}
      </Container>
    )
  },
)

export default EndlessScrollableContainer
