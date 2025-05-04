import { ActionContainer, ActionLeft, ActionRight, RightAction, LeftAction } from './components'

export type SwipeActionsProps = {
  leftAction?: React.ReactNode
  rightAction?: React.ReactNode
  leftProps?: React.ComponentProps<typeof ActionLeft>
  rightProps?: React.ComponentProps<typeof ActionRight>
  containerProps?: React.ComponentProps<typeof ActionContainer>
}

const SwipeActions = ({ leftAction, rightAction, leftProps, rightProps, containerProps }: SwipeActionsProps) => (
  <ActionContainer {...containerProps}>
    {leftAction && <ActionLeft {...leftProps}>
      {leftAction}
    </ActionLeft>}
    {rightAction && <ActionRight {...rightProps}>
      {rightAction}
    </ActionRight>}
  </ActionContainer>
)

SwipeActions.Left = LeftAction
SwipeActions.Right = RightAction

export default SwipeActions