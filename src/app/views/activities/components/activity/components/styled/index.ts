import { theme } from 'src/styles/vars'
import { Form, Modal } from 'antd'
import styled from 'styled-components'

export const StyledForm = styled(Form)<{ $isEdit: boolean; }>`
  position: relative;
  padding: 15px;
  ${({ $isEdit }) => $isEdit ? 'padding-top: 40px' : ''}
`

export const StyledDateFormItem = styled(Form.Item)<{ $isEdit: boolean; }>`
  position: absolute;
  right: 7px;
  top: ${({ $isEdit }) => $isEdit ? '35px' : '10px'};
  z-index: 100;
  width: 120px;
`

export const StyledFormItem = styled(Form.Item)`
  margin-bottom: 0;

  & > .ant-form-item-control > .ant-form-item-control-input > .ant-form-item-control-input-content {
    display: flex;
    justify-content: space-between;
  }

  .ant-picker {
    width: 100%;
  }
`
export const ShortFormItem = styled(Form.Item)<{ $fullWidth: boolean; $margin: boolean; }>`
  display: ${({ $fullWidth }) => $fullWidth ? 'block' : 'inline-block'};
  width: ${({ $fullWidth }) => $fullWidth ? '100%' : 'calc(50% - 8px)'};
  margin-right: ${({ $margin }) => $margin ? '8px' : ''};
`

export const ImageFormItem = styled(Form.Item)`
  transition: none;

  .ant-form-item-control-input-content > span {
    display: flex;
    & .ant-upload-btn {
      padding: 35px 0;
    }
    & .ant-upload-list-picture-card {
      order: -1;
    }
  }
`

export const CreateEditFormItem = styled(Form.Item)`
  margin-bottom: 0;
`

export const StyledModal = styled(Modal)`
  .ant-modal-header {
    padding-right: 52px;
  }
`

export const WorkoutFormItem = styled(Form.Item)`
  & label[for="workout_id"].ant-form-item-required {
    width: 100%;
  }
`

export const WorkoutLabelContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  & .ant-picker {
    padding: 0;
  }
  & .ant-picker-input input {
    text-align: right;
  }
`

export const StopwatchContainer = styled.div`
  margin-left: 32px;
  display: flex;
  margin-block: -1px;
  color: ${theme.textColor};
  font-weight: 400;

  & .activity-timer {
    background-color: white;
  }
`
