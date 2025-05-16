import { EditFilled } from '@ant-design/icons'
import styled from 'styled-components'

export const Container = styled.div`
  position: relative;
  overflow-x: hidden;
  display: flex;
  flex: 1;
  align-items: start;
  max-width: 100%;
  flex-wrap: wrap;
`

export const ActionText = styled.span`
  font-size: 14px;
  font-weight: bold;
  color: white;
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
