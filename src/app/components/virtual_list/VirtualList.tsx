import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  StyleHTMLAttributes,
  FC,
  ReactNode,
} from 'react'
import numInRange from 'app/utils/numInRange'

const ListItem = ({ children, style }) => (
  <div style={style}>
    {children}
  </div>
)

const getPositionData = ({
  orientation,
  prevPos,
  DOMEl,
  overscanCount,
  itemHeight,
  itemWidth,
}) => {
  const isVertical = orientation === 'vertical'
  const itemSize = isVertical ? itemHeight : itemWidth

  const scrollOffset = isVertical ? DOMEl.scrollTop : DOMEl.scrollLeft
  const index = Math.floor(scrollOffset / itemSize) - Math.ceil(overscanCount / 2)
  const direction = prevPos < scrollOffset
    ? 'forward'
    : prevPos > scrollOffset
      ? 'backward'
      : 'none'

  return {
    scrollOffset,
    direction,
    index,
  }
}

interface IVirtualList {
  listComponent?: string | FC<any> | React.ForwardRefRenderFunction<any, any>,
  data: any[],
  orientation?: 'horizontal' | 'vertical',
  width?: number,
  height?: number,
  itemWidth?: number,
  itemHeight?: number,
  onScroll?: Function,
  onRenderedItemsChange?: ({ startIndex, endIndex, scrollOffset }: { startIndex:number, endIndex:number, scrollOffset:number }) => any,
  itemContainerRenderer?: Function,
  overscanCount?: number,
  msToSetNotScrolling?: number,
  componentStyle?: StyleHTMLAttributes<any>,
  listStyle?:  StyleHTMLAttributes<any>,
  onScrollEnd?: Function,
  children?: (el: any, index: number) => ReactNode,
}

export interface IVirtualListRef {
  $component: HTMLDivElement,
  $list: HTMLElement,
  getScrollPos: () => number,
  scrollTo: (number) => void,
  isScrolling: boolean,
}

const VirtualList = React.forwardRef<IVirtualListRef, IVirtualList>(
  function VirtualList(
    {
      listComponent,
      data,
      orientation,
      width,
      height,
      itemWidth,
      itemHeight,
      onScroll,
      itemContainerRenderer,
      overscanCount,
      componentStyle,
      listStyle,
      onScrollEnd,
      onRenderedItemsChange,
      msToSetNotScrolling,
      children,
    },
    ref,
  ) {
    const visibleItemsCount = Math.ceil(orientation === 'vertical'
      ? height / itemHeight
      : width / itemWidth)

    const [ startIndex, setStartIndex ] = useState(0)
    const [ endIndex, setEndIndex ] = useState(() => orientation === 'vertical'
      ? Math.round(height / itemHeight) + overscanCount
      : Math.round(width / itemWidth) + overscanCount)

    const [ isScrollEnd, setIsScrollEnd ] = useState(false)
    const [ isScrolling, setIsScrolling ] = useState(false)
    const scrollingTimeoutRef = useRef<NodeJS.Timeout | number | undefined>()

    const prevScrollOffset = useRef(0)
    const $component = useRef<HTMLDivElement>()
    const $list = useRef<HTMLElement>(null)

    const style = {
      height,
      width,
      overflow: 'scroll',
      backgroundColor: 'white',
      ...componentStyle,
    }

    const handleScroll = (e) => {
      if (!isScrolling) setIsScrolling(true)
      
      clearTimeout(scrollingTimeoutRef.current as number)
      scrollingTimeoutRef.current = setTimeout(() => setIsScrolling(false), msToSetNotScrolling)

      let _endIndex = endIndex
      let { scrollOffset, direction, index: _startIndex } = getPositionData({
        overscanCount,
        orientation,
        prevPos: prevScrollOffset.current,
        DOMEl: e.target,
        itemHeight,
        itemWidth,
      })

      if (direction !== 'none') {
        if (_startIndex < 0) _startIndex = 0
        
        _endIndex = _startIndex + visibleItemsCount + overscanCount
        if (_endIndex > data.length - 1) _endIndex = data.length
        if (_endIndex - _startIndex < visibleItemsCount + overscanCount) _startIndex = _endIndex - (visibleItemsCount + overscanCount)

        if (_startIndex !== startIndex) setStartIndex(numInRange(_startIndex, [ 0 ]))
        if (_endIndex !== endIndex) setEndIndex(_endIndex)
      }

      prevScrollOffset.current = scrollOffset
      if (onScroll) onScroll(e, { direction, startIndex: _startIndex, endIndex: _endIndex, scrollOffset })
      if (isScrollEnd) setIsScrollEnd(false)
    }

    const scrollTo = value => $component.current.scrollTo(...(orientation === 'vertical' ? [ 0, value ] : [ value, 0 ]))

    const itemStyle = {
      position: 'absolute',
      margin: 0,
      flexShrink: 0,
      width: orientation === 'vertical' ? '100%' : itemWidth,
      height: orientation === 'vertical' ? itemHeight : '100%',
    }

    const renderListItem = typeof itemContainerRenderer === 'function'
      ? (el, i) =>
        itemContainerRenderer({
          el,
          key: i + startIndex,
          index: i + startIndex,
          width: itemWidth,
          height: itemHeight,
          orientation,
          style: {
            ...itemStyle,
            top: orientation === 'vertical' ? (i + startIndex) * itemHeight : 0,
            left: orientation === 'vertical' ? 0 : (i + startIndex) * itemWidth,
          },
          children: children ? children(el, i + startIndex) : undefined,
        })
      : (el, i) => (
        <ListItem
          key={i + startIndex}
          style={{
            ...itemStyle,
            top: orientation === 'vertical' ? (i + startIndex) * itemHeight : 0,
            left: orientation === 'vertical' ? 0 : (i + startIndex) * itemWidth,
          }}
        >
          {children(el, i + startIndex)}
        </ListItem>
      )

    useImperativeHandle(ref, () => ({
      $component: $component.current,
      $list: $list.current,
      getScrollPos: () => prevScrollOffset.current,
      startIndex,
      endIndex,
      scrollTo,
      isScrolling,
    }))

    useEffect(() => {
      if (!isScrolling && endIndex === data.length && !isScrollEnd) {
        const componentRect = $component.current.getBoundingClientRect()
        const listRect = $list.current.getBoundingClientRect()

        if (componentRect.right === listRect.right) setIsScrollEnd(true)
      }
    }, [ isScrolling, endIndex, data, isScrollEnd ])

    useEffect(() => {
      if (isScrollEnd && onScrollEnd) onScrollEnd()
    }, [ isScrollEnd ])

    useEffect(() => {
      if (onRenderedItemsChange) onRenderedItemsChange({ startIndex, endIndex, scrollOffset: prevScrollOffset.current })
    }, [ startIndex, endIndex ])

    return (
      <div ref={$component} style={style} onScroll={handleScroll}>
        {React.createElement(
          listComponent,
          {
            ref: $list,
            style: {
              width: orientation === 'vertical' ? (itemWidth ?? '100%') : (data.length * itemWidth),
              height: orientation === 'vertical' ? (data.length * itemHeight) : (itemHeight ?? '100%'),
              position: 'relative',
              ...listStyle,
            },
            startIndex,
            endIndex,
          },
          data.slice(startIndex, endIndex).map(renderListItem),
        )}
      </div>
    )
  },    
)

VirtualList.defaultProps = {
  listComponent: 'div',
  data: [],
  orientation: 'vertical',
  overscanCount: 6,
  componentStyle: {},
  listStyle: {},
  msToSetNotScrolling: 300,
}

export default VirtualList
