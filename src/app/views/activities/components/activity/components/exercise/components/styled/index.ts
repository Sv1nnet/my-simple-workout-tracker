import { Radio, Typography } from 'antd'
import styled from 'styled-components'

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
`

export const HistoryContainer = styled.div`
  display: flex;
  overflow: hidden;
`

export const ImageContainer = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  height: 120px;
  width: 120px;
  background-color: #f5f5f5;
`

export const HistoryButtonsContainer = styled.div`
  text-align: right;
  margin-bottom: 5px;
`

export const StyledRadio = styled(Radio.Group)`
  & > label.ant-radio-button-wrapper {
    border-width: 2px;
  }
`

export const ResultTypeButtonsContainer = styled.div`
  text-align: right;
`

export const ExerciseTitle = styled(Typography.Title)`
  margin-bottom: 0;
  line-height: 1;
`
