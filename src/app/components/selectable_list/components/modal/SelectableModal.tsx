import { Modal, ModalProps } from 'antd'
import { FC, useRef, useState } from 'react'

export const useModalUtils = ({
  visible = false,
  selected = {},
  selectionEnabled = false,
  allSelected = false,
  handleCancelSelection = () => {},
  handleSelect = () => {},
} = {
  visible: false,
  selected: {},
  selectionEnabled: false,
  allSelected: false,
  handleCancelSelection: () => {},
  handleSelect: () => {},
}) => {
  const [ isModalVisible, setModalVisible ] = useState(visible)
  const selectionRef = useRef({
    selected,
    selectionEnabled,
    allSelected,
    handleCancelSelection,
    handleSelect,
  })

  const openModal = () => setModalVisible(true)
  const closeModal = () => setModalVisible(false)

  return {
    isModalVisible,
    selectionRef,
    openModal,
    closeModal,
  }
}

export interface ISelectableModalProps extends ModalProps {
  text?: string;
  selected: object;
}

const SelectableModal: FC<ISelectableModalProps> & { useModalUtils: Function } = ({ children, text, selected, ...props }) => (
  <Modal {...props }>
    {children ?? `${text} (${Object.values(selected).filter(Boolean).length})`}
  </Modal>
)

SelectableModal.useModalUtils = useModalUtils

export default SelectableModal