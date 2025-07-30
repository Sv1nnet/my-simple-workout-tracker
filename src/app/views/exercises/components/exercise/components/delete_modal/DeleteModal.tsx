import { Modal } from 'antd'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'

export type DeleteModalProps = {
  onDelete: () => void
  isOpen: boolean
  onCancel: () => void
  isFetching: boolean
}

const DeleteModal = ({ onDelete, isOpen, onCancel, isFetching }: DeleteModalProps) => {
  const { intl } = useIntlContext()
  const { modal } = intl.pages.exercises

  return   (
    <Modal
      open={isOpen}
      okText={modal.delete.ok_button}
      onOk={onDelete}
      okButtonProps={{ danger: true, type: 'default', loading: isFetching }}
      cancelText={modal.delete.cancel_button}
      onCancel={onCancel}
    >
      {modal.delete.body_single}
    </Modal>
  )
}

export default DeleteModal