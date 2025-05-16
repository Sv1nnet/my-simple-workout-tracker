import { EditFilled } from '@ant-design/icons'
import { Checkbox } from 'antd'
import styled from 'styled-components'
export const StyledCheckbox = styled(Checkbox)`
  position: absolute;
  top: 19px;
  left: 16px;
  z-index: 1;
`

export const Container = styled.div`
  position: relative;
  width: 100%;
  overflow-x: hidden;
`

export const ActionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80px;
`

export const ActionText = styled.span`
  font-size: 14px;
  font-weight: bold;
  color: white;
`

export const StyledActionIcon = styled(EditFilled)`
  font-size: 28px;
  color: white;
`
