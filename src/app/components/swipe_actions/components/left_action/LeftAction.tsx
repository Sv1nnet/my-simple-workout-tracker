import { HTMLAttributes, ReactNode } from 'react'
import styled from 'styled-components'
import { theme } from 'styles/vars'

const StyledContainer = styled.div<{ $isActive: boolean }>`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  background: ${({ $isActive }) => $isActive ? theme.actionColors.edit.active : theme.actionColors.edit.inactive};
  transition: background 0.15s ease;
`

export type LeftActionProps = HTMLAttributes<HTMLDivElement> & {
  isActive: boolean
  text?: ReactNode
  icon?: ReactNode
}

const LeftAction = ({ isActive, icon, text, ...props }: LeftActionProps) => (
  <StyledContainer $isActive={isActive} {...props}>
    {icon}
    {text}
  </StyledContainer>
)

export default LeftAction
