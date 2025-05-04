import { HTMLAttributes } from 'react'
import styled from 'styled-components'
import { theme } from 'styles/vars'

const StyledContainer = styled.div<{ $isActive: boolean }>`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  background: ${({ $isActive }) => $isActive ? theme.actionColors.start.active : theme.actionColors.start.inactive};
  transition: background 0.15s ease;
`

export type RightActionProps = HTMLAttributes<HTMLDivElement> & {
  isActive: boolean
}

const RightAction = ({ isActive, children, ...props }: RightActionProps) => (
  <StyledContainer $isActive={isActive} {...props}>
    {children}
  </StyledContainer>
)

export default RightAction
