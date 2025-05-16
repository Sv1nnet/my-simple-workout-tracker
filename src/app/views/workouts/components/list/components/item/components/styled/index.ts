import styled from 'styled-components'
import { CaretRightFilled, EditFilled } from '@ant-design/icons'

export const Container = styled.div`
  position: relative;
  width: 100%;
  overflow-x: hidden;
`

export const ActionText = styled.span<{ $marginTop?: number }>`
  font-size: 14px;
  font-weight: bold;
  color: white;
  line-height: 1;
  margin-top: ${({ $marginTop = 0 }) => $marginTop}px;
`

export const ActionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80px;
`

export const StyledActionIcon = styled(EditFilled)`
  font-size: 28px;
  color: white;
`

export const StyledRightActionIcon = styled(CaretRightFilled)`
  font-size: 36px;
  margin-left: 5px;
  color: white;
`
