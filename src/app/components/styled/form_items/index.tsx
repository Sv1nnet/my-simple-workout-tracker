import { Button } from 'antd'
import styled from 'styled-components'

export const FormActionButtonsContainer = styled.div`
  position: absolute;
  z-index: 1;
  top: 6px;
  right: 15px;
  display: flex;
`

export const ToggleEdit = styled(Button)<{ $enable?: boolean }>`
  ${({ $enable }) => $enable ? `
    margin-right: 8px;
  ` : `
    margin-top: 15px;
  `}
`

export const CopyButton = styled(Button)`
  margin-right: 8px;
`

export const LabelInnerWithIcon = styled.div`
  display: flex;
  align-items: flex-end;
`
