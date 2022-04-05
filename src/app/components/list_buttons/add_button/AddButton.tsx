import { PlusOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import Link from 'next/link'
import React, { FC } from 'react'
import styled from 'styled-components'

const StyledButton = styled(Button)`
  display: block;
  margin: 2px auto;
  width: calc(100% - 10px);
`

export interface IAddButton {
  href: string;
  icon?: string | React.ReactElement;
  text?: string;
  buttonProps?: object;
  linkProps?: object;
}

const AddButton: FC<IAddButton> = ({ href, icon, text, children, buttonProps, linkProps }) => (
  <Link href={href} {...linkProps}>
    <StyledButton size="large" type="default" block {...buttonProps}>
      {children || (
        <>
          {icon}
          &nbsp;
          {text}
        </>
      )}
    </StyledButton>
  </Link>
)

AddButton.defaultProps = {
  icon: <PlusOutlined />,
  text: '',
}

export default AddButton
