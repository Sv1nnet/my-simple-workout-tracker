import { Form, Modal } from 'antd'
import styled from 'styled-components'

export const StyledForm = styled(Form)`
  position: relative;
  padding: 15px;
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
export const ShortFormItem = styled(Form.Item)<{ $fullWidth?: boolean; $margin?: boolean; }>`
  display: ${({ $fullWidth }) => $fullWidth ? 'block' : 'inline-block'};
  width: ${({ $fullWidth }) => $fullWidth ? '100%' : 'calc(50% - 4px)'};
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

export const HoursFormItem = styled(Form.Item)`
  margin-bottom: 0;

 & .ant-form-item-control-input {
   min-height: 14px;
 }

 & .ant-form-item {
   margin-bottom: 18px;
 }
`