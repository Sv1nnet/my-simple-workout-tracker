import styled from 'styled-components'

export const ActionContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
  overflow: hidden;
`

const Action = styled.div`
  position: relative;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-basis: 50%;
  align-items: center;
`

export const ActionRight = styled(Action)`
  background: var(--primary-color-light);
  justify-content: flex-end;
`

export const ActionLeft = styled(Action)`
  background: var(--warning-color);
  justify-content: flex-start;
`
