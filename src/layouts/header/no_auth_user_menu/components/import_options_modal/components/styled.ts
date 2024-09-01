import { Modal, Typography } from 'antd'
import styled from 'styled-components'

const { Paragraph } = Typography

export const InputContainer = styled.div`
  display: flex;
  margin-block: 12px;
`

export const NoteTextContainer = styled(Paragraph)`
  &.ant-typography {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 0;
    margin-left: 7px;
  }
`

export const StyledModal = styled(Modal)`
  .ant-modal-header {
    padding-right: 54px;
  }
`