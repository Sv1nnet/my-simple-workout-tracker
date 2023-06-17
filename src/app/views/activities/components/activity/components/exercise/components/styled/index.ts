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

export const HistoryButtonsContainer = styled.div`
  text-align: right;
  margin-bottom: 5px;
`

export const StyledRadio = styled(Radio.Group)`
  & > label.ant-radio-button-wrapper {
    border-width: 2px;
  }
`

export const HistoryButtonIcon = styled.img<{ $table?: boolean }>`
  position: relative;
  top: -2px;
  ${({ $table }) => $table ? 'transform: scale(1, .7);' : ''}
`

export const ResultTypeButtonsContainer = styled.div`
  text-align: right;
`

export const ExerciseTitle = styled(Typography.Title)`
  margin-bottom: 0;
  line-height: 1;
`
