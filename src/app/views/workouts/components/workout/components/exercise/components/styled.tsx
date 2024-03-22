import { Select } from 'antd'
import styled from 'styled-components'

export const ExerciseContainer = styled.div`
  position: relative;
`

export const StyledSelect = styled(Select)`
  &.ant-select-disabled .ant-typography { 
    color: rgba(0, 0, 0, 0.45);
  }
`

export const MoveExerciseButtonContainer = styled.div<{ $hasTopButton?: boolean, $hasBottomButton?: boolean }>`
  position: absolute;
  z-index: 1;
  top: ${({ $hasTopButton }) => $hasTopButton ? '-25px' : '0px'};
  left: 50%;
  background: white;
  border: 1px lightgrey solid;
  ${({ $hasBottomButton }) => !$hasBottomButton ? 'border-bottom: 1px white solid;' : ''}
  ${({ $hasTopButton }) => !$hasTopButton ? 'border-top: 1px white solid;' : ''}
  transform: translateX(-50%);
  border-radius: ${({ $hasBottomButton, $hasTopButton }) => `${$hasTopButton ? '25px 25px' : '0 0'} ${$hasBottomButton ? '25px 25px' : '0 0'}`};
  width: 50px;
  overflow: hidden;

  button {
    width: 100%;
    padding: 0;
  }
`