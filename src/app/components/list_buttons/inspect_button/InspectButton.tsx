import { Button, ButtonProps, Spin, SpinProps } from 'antd'
import { EyeOutlined, LoadingOutlined } from '@ant-design/icons'
import { FC } from 'react'
import { Link } from 'react-router-dom'

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
    <Button onClick={e => e.stopPropagation()} {...buttonProps}>
      <Link to={href}>
        <EyeOutlined size={3} />
      </Link>
    </Button>
  )

export default InspectButton
