import { Button } from 'antd'
import styled from 'styled-components'

export const FormActionButtonsContainer = styled.div`
  position: absolute;
  z-index: 1;
  top: 6px;
  right: 15px;
  display: flex;
`

export const ToggleEdit = styled(Button)`
  ${({ $enable }) => $enable ? `
    margin-right: 15px;
  ` : `
    margin-top: 15px;
  `}
`

export const DeleteEntity = styled(Button)`
  
`