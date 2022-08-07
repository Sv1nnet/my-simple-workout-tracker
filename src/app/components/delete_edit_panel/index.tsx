import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { FormActionButtonsContainer, ToggleEdit } from '../styled'
import { Button } from 'antd'
import { FC, MouseEventHandler } from 'react'

export interface IDeleteEditPanel {
  onEditClick: MouseEventHandler<HTMLElement>,
  onDeleteClick: MouseEventHandler<HTMLElement>,
  isEditMode: boolean,
  deleteButtonProps?: object,
  editButtonProps?: object,
}

const DeleteEditPanel: FC<IDeleteEditPanel> = ({ onEditClick, onDeleteClick, deleteButtonProps, editButtonProps, isEditMode }) => (
  <FormActionButtonsContainer>
    {!isEditMode && <ToggleEdit onClick={onEditClick} $enable {...editButtonProps}><EditOutlined /></ToggleEdit>}
    <Button type="primary" danger onClick={onDeleteClick} {...deleteButtonProps}><DeleteOutlined /></Button>
  </FormActionButtonsContainer>
)

export default DeleteEditPanel
