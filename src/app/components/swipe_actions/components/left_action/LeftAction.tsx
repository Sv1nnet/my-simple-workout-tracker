import { HTMLAttributes } from 'react'
import styled from 'styled-components'

const StyledContainer = styled.div<{ $isActive: boolean }>`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $isActive }) => $isActive ? 'var(--action-color-edit-active)' : 'var(--action-color-edit-inactive)'};
  transition: background 0.15s ease;
`

export type LeftActionProps = HTMLAttributes<HTMLDivElement> & {
  isActive: boolean
}

const LeftAction = ({ isActive, children, ...props }: LeftActionProps) => (
  <StyledContainer $isActive={isActive} {...props}>
    {children}
  </StyledContainer>
)

export default LeftAction
