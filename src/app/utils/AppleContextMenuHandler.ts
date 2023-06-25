import { TouchEventHandler } from 'react'

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

    this.onTouchStartCb?.(e)

    this.longPressCountdown = setTimeout(() => {
      this.contextMenuPossible = false
      this.callback(e)
    }, longPressDuration)
  }

  onTouchMove: TouchEventHandler = (e) => {
    this.onTouchMoveCb?.(e)
    clearTimeout(this.longPressCountdown)
  }

  onTouchCancel: TouchEventHandler = (e) => {
    this.contextMenuPossible = false
    this.onTouchCancelCb?.(e)
    clearTimeout(this.longPressCountdown)
  }

  onTouchEnd: TouchEventHandler = (e) => {
    this.contextMenuPossible = false
    this.onTouchEndCb?.(e)
    clearTimeout(this.longPressCountdown)
  }
}
