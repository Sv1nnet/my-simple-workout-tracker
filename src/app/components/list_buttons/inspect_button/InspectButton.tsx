import Link from 'next/link'
import { Button, ButtonProps, Spin, SpinProps } from 'antd'
import { EyeOutlined, LoadingOutlined } from '@ant-design/icons'
import { FC } from 'react'

export interface IInspectButton {
  loading: boolean;
  href: string;
  buttonProps?: ButtonProps;
  spinProps?: SpinProps;
}

const InspectButton: FC<IInspectButton> = ({ loading, href, buttonProps, spinProps }) => loading
  ? (
    <Button>
      <Spin size="small" indicator={<LoadingOutlined />} {...spinProps} />
    </Button>
  )
  : (
    <Link href={href}>
      <Button onClick={e => e.stopPropagation()} {...buttonProps}>
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a><EyeOutlined size={3} /></a>
      </Button>
    </Link>
  )

InspectButton.defaultProps = {
  buttonProps: {},
  spinProps: {},
}

export default InspectButton
