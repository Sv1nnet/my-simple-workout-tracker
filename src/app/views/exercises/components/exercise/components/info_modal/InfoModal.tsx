import { Modal } from 'antd'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'

export type InfoModalProps = {
  isOpen: boolean
  onCancel: () => void
  onOk: () => void
  isDefault?: boolean
  isInActivity?: boolean
  isJustCopy?: boolean
}

const InfoModal = ({ isOpen, isDefault, isInActivity, isJustCopy, onCancel, onOk }: InfoModalProps) => {
  const { intl } = useIntlContext()
  const { modal } = intl.pages.exercises

  return (
    <Modal
      open={isOpen}
      okText={isJustCopy ? modal.info_modal.ok_button_create : modal.info_modal.ok_button}
      onOk={onOk}
      cancelButtonProps={{
        hidden: !isJustCopy,
      }}
      cancelText={modal.info_modal.cancel_button}
      onCancel={onCancel}
    >
      {isDefault
        ? intl.pages.exercises.modal.info_modal.change_default.body
        : isInActivity
          ? intl.pages.exercises.modal.info_modal.in_activity.body
          : isJustCopy
            ? intl.pages.exercises.modal.info_modal.just_copy.body
            : ''}
    </Modal>
  )
}

export default InfoModal