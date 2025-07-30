import { CopyOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { FormActionButtonsContainer, ToggleEdit, CopyButton } from 'components/styled'
import { Button } from 'antd'
import { FC, MouseEventHandler } from 'react'

export type ButtonType = 'delete' | 'edit' | 'copy'
const BUTTON_TYPES = {
  delete: ({ onDeleteClick, deleteButtonProps }: { onDeleteClick: MouseEventHandler<HTMLElement>, deleteButtonProps: object }) => (
    <Button type="primary" danger onClick={onDeleteClick} {...deleteButtonProps}><DeleteOutlined /></Button>
  ),
  edit: ({ onEditClick, editButtonProps }: { onEditClick: MouseEventHandler<HTMLElement>, editButtonProps: object }) => (
    <ToggleEdit onClick={onEditClick} $enable {...editButtonProps}><EditOutlined /></ToggleEdit>
  ),
  copy: ({ onCopyClick, copyButtonProps }: { onCopyClick: MouseEventHandler<HTMLElement>, copyButtonProps: object }) => (
    <CopyButton onClick={onCopyClick} {...copyButtonProps}><CopyOutlined /></CopyButton>
  ),
}

export interface IDeleteEditPanel {
  onEditClick: MouseEventHandler<HTMLElement>,
  onDeleteClick: MouseEventHandler<HTMLElement>,
  onCopyClick: MouseEventHandler<HTMLElement>,
  showDeleteButton?: boolean,
  showEditButton?: boolean,
  showCopyButton?: boolean,
  deleteButtonProps?: object,
  editButtonProps?: object,
  copyButtonProps?: object,
  buttons: ButtonType[],
}

const TopButtonsPanel: FC<IDeleteEditPanel> = ({
  onEditClick,
  onDeleteClick,
  onCopyClick,
  copyButtonProps,
  deleteButtonProps,
  editButtonProps,
  buttons,
}) => (
  <FormActionButtonsContainer>
    {
      buttons
        .map(button => BUTTON_TYPES[button]({
          onEditClick,
          editButtonProps,
          onDeleteClick,
          onCopyClick,
          copyButtonProps,
          deleteButtonProps,
        }))
    }
  </FormActionButtonsContainer>
)

export default TopButtonsPanel
