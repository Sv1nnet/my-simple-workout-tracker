import { Button, Form, Modal } from 'antd'
import styled from 'styled-components'

export const StyledForm = styled(Form)`
  position: relative;
  padding: 15px;
`
export const StyledFormItem = styled(Form.Item)`
  margin-bottom: 0;

  & > .ant-form-item-control > .ant-form-item-control-input > .ant-form-item-control-input-content {
    display: flex;
    justify-content: space-around;
  }

  .ant-picker {
    width: 100%;
  }
`
export const ShortFormItem = styled(Form.Item)`
  display: ${({ $fullWidth, $checkbox }) => $fullWidth ? 'block' : $checkbox ? 'flex' : 'inline-block'};
  width: ${({ $fullWidth }) => $fullWidth ? '100%' : 'calc(50% - 8px)'};
  margin-right: ${({ $margin }) => $margin ? '8px' : ''};
  .ant-form-item-control {
    justify-content: ${({ $checkbox }) => $checkbox ? 'flex-end' : ''};
    .ant-form-item-control-input {
      min-height: ${({ $checkbox }) => $checkbox ? '40px' : ''};
    }
  }
`

export const CreateEditFormItem = styled(Form.Item)`
  margin-bottom: 0;
`

export const ToggleEdit = styled(Button)`
  ${({ $enable }) => $enable ? `
    position: absolute;
    z-index: 1;
    top: 6px;
    right: 15px;
  ` : `
    margin-top: 15px;
  `}
`

export const DeleteButton = styled(Button)`
  position: absolute;
  z-index: 1;
  top: 8px;
  right: -8px;
`

export const StyledModal = styled(Modal)`
  .ant-modal-header {
    padding-right: 52px;
  }
`
