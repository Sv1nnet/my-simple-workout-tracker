import React, { FC } from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { Spin } from 'antd'

const StyledButton = styled(Button)`
  display: block;
  margin: 5px auto 0;
  width: calc(100% - 10px);

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

export interface IAddButton {
  href: string;
  icon?: string | React.ReactElement;
  text?: string;
  loading?: boolean;
  buttonProps?: object;
  linkProps?: object;
}

const AddButton: FC<IAddButton> = ({ href, icon, text, children, loading, buttonProps, linkProps }) => (
  <Link href={href} {...linkProps}>
    <StyledButton size="large" type="default" block disabled={loading} {...buttonProps}>
      {children || (
        <>
          {loading ? <Spin indicator={<LoadingOutlined style={{ color: 'rgba(0, 0, 0, 0.25)' }} />} /> : icon}
          &nbsp;
          <span style={{ display: 'inline-block', marginLeft: loading ? 0 : 4 }}>{text}</span>
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
