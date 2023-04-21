import { TouchEventHandler } from 'react'
import isFunc from './isFunc'

const longPressDuration = 610

export default class AppleContextMenuHandler {
  public contextMenuPossible = false

  private longPressCountdown = null

  private callback: Function = () => {}

  private onTouchStartCb?: TouchEventHandler

  private onTouchEndCb?: TouchEventHandler

  private onTouchMoveCb?: TouchEventHandler

  private onTouchCancelCb?: TouchEventHandler

  constructor(callback: Function, {
    onTouchStart,
    onTouchEnd,
    onTouchMove,
    onTouchCancel,
  }: {
    onTouchStart?: TouchEventHandler;
    onTouchEnd?: TouchEventHandler;
    onTouchMove?: TouchEventHandler;
    onTouchCancel?: TouchEventHandler;
  } = {}) {
    this.callback = callback
    this.onTouchStartCb = onTouchStart
    this.onTouchEndCb = onTouchEnd
    this.onTouchMoveCb = onTouchMove
    this.onTouchCancelCb = onTouchCancel
  }

  onTouchStart: TouchEventHandler = (e) => {
    this.contextMenuPossible = true

    if (isFunc(this.onTouchStartCb)) this.onTouchStartCb(e)

    this.longPressCountdown = setTimeout(() => {
      this.contextMenuPossible = false
      this.callback(e)
    }, longPressDuration)
  }

  onTouchMove: TouchEventHandler = (e) => {
    if (isFunc(this.onTouchMoveCb)) this.onTouchMoveCb(e)
    clearTimeout(this.longPressCountdown)
  }

  onTouchCancel: TouchEventHandler = (e) => {
    this.contextMenuPossible = false
    if (isFunc(this.onTouchCancelCb)) this.onTouchCancelCb(e)
    clearTimeout(this.longPressCountdown)
  }

  onTouchEnd: TouchEventHandler = (e) => {
    this.contextMenuPossible = false
    if (isFunc(this.onTouchEndCb)) this.onTouchEndCb(e)
    clearTimeout(this.longPressCountdown)
  }
}
