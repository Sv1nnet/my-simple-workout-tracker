import { Modal } from 'antd'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'

export type InfoModalProps = {
  isOpen: boolean
  onCancel: () => void
  onOk: () => void
  isInActivity?: boolean
  isJustCopy?: boolean
}

const InfoModal = ({ isOpen,  isInActivity, isJustCopy, onCancel, onOk }: InfoModalProps) => {
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
      {isInActivity
        ? intl.pages.workouts.modal.info_modal.in_activity.body
        : isJustCopy
          ? intl.pages.workouts.modal.info_modal.just_copy.body
          : ''}
    </Modal>
  )
}

export default InfoModal
