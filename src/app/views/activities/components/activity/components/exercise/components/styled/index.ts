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
  background-color: var(--disabled-background-color);
`

export const HistoryButtonsContainer = styled.div`
  text-align: right;
  margin-bottom: 5px;
`

export const StyledRadio = styled(Radio.Group)`

& > label.ant-radio-button-wrapper {
    background-color: var(--background-color);
    border-color: var(--border-color-base);
    border-width: 2px;

    &.ant-radio-button-wrapper-checked:not([class*=' ant-radio-button-wrapper-disabled']).ant-radio-button-wrapper:first-child {
      background-color: var(--background-color);
      border-color: var(--primary-color);
    }

    &:not(.ant-radio-button-wrapper-checked) {
      &:before {
        background-color: var(--border-color-base);
      }
    }

    &.ant-radio-button-wrapper-checked {
      background-color: var(--background-color);
      border-color: var(--primary-color);
      
      &:before {
        background-color: var(--primary-color);
      }
    }

    & svg {
      line, rect {
        stroke: var(--text-color);
      }
    }
  }
`

export const ResultTypeButtonsContainer = styled.div`
  text-align: right;
  min-width: 88px;
`

export const ExerciseTitle = styled(Typography.Title)`
  margin-bottom: 0;
  line-height: 1;
`
