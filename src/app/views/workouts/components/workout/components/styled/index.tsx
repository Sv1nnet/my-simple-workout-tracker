import { Button, Form } from 'antd'
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
export const ShortFormItem = styled(Form.Item)<{ $fullWidth?: boolean, $checkbox?: boolean, $margin?: boolean }>`
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

export const DeleteButton = styled(Button)`
  position: absolute;
  z-index: 1;
  top: 8px;
  right: -8px;
`
