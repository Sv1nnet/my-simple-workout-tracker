import { Modal } from 'antd'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'

export type DoneInfoModalProps = {
  isOpen: boolean
  onOk: () => void
}

const DoneInfoModal = ({ isOpen, onOk }: DoneInfoModalProps) => {
  const { intl } = useIntlContext()
  const { modal } = intl.pages.activities
  const { ok_text } = intl.modal.common

  return (
    <Modal
      open={isOpen}
      okText={ok_text}
      onOk={onOk}
      onCancel={onOk}
      cancelButtonProps={{
        hidden: true,
      }}
    >
      <div style={{ marginTop: 10 }}>
        {modal.done_info.body}
      </div>
    </Modal>
  )
}

export default DoneInfoModal