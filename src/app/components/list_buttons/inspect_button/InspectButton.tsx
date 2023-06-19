import { Button, ButtonProps, Spin, SpinProps } from 'antd'
import { EyeOutlined, LoadingOutlined } from '@ant-design/icons'

export type InspectButtonProps = {
  loading: boolean;
  id: string;
  href: string;
  onClick: (id: string) => void;
  buttonProps?: ButtonProps;
  spinProps?: SpinProps;
}

const InspectButton = ({ onClick, loading, href, id, buttonProps, spinProps }: InspectButtonProps) => {
  const handleClick = (e) => {
    e.preventDefault()
    onClick?.(id)
  }

  return loading
    ? (
      <Button>
        <Spin size="small" indicator={<LoadingOutlined />} {...spinProps} />
      </Button>
    )
    : (
      <Button onClick={e => e.stopPropagation()} {...buttonProps}>
        <a onClick={handleClick} href={href}>
          <EyeOutlined size={3} />
        </a>
      </Button>
    )
}

export default InspectButton
