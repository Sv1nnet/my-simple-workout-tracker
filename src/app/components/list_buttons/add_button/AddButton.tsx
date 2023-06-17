import React, { FC, ReactNode } from 'react'
import styled from 'styled-components'
import { PlusOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { Link } from 'react-router-dom'

const StyledButton = styled(Button)`
  display: block;
  margin: 5px auto 0;
  width: calc(100% - 10px);
  overflow: hidden;

  & > span {
    position: relative;
    transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);

    & > .icon-wrapper {
      position: absolute;
      top: 0;
      left: 0;
    }
  }
`

export const Text = styled.span`
  display: inline-block;
  margin-left: 4px;
`

export interface IAddButton {
  href: string;
  children?: ReactNode;
  icon?: string | React.ReactElement;
  text?: ReactNode;
  loading?: boolean;
  buttonProps?: object;
  linkProps?: object;
}

const Icon = <PlusOutlined />

const AddButton: FC<IAddButton> = ({ href, text = '', icon = Icon, children, buttonProps, linkProps }) => (
  <StyledButton size="large" type="default" block {...buttonProps}>
    <Link to={href} {...linkProps}>
      {children || (
        <>
          {icon}
          <Text>&nbsp;{text}</Text>
        </>
      )}
    </Link>
  </StyledButton>
)

export default AddButton
