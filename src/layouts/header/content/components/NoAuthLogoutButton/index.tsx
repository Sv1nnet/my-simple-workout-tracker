import styled from 'styled-components'
import { Button, Modal } from 'antd'
import { LoginOutlined } from '@ant-design/icons'
import { logoutWithNoAuth } from 'app/store/slices/auth'
import { useAppDispatch } from 'app/hooks'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { useAppLoaderContext } from 'app/contexts/loader/AppLoaderContextProvider'
import browserDBLoader from 'app/store/utils/BrowserDB/browserDB.loader'

const StyledButton = styled(Button)`
  position: absolute;
  margin-right: 13px;
  right: 3px;
  cursor: pointer;
`

const NoAuthLogoutButton = () => {
  const { intl: { common, header } } = useIntlContext()
  const dispatch = useAppDispatch()
  const { runLoader, stopLoaderById } = useAppLoaderContext()

  const logout = () => {
    function completeLogout(modal: ReturnType<typeof Modal.confirm>) {
      modal.destroy()
      dispatch(logoutWithNoAuth())
    }

    const modal = Modal.confirm({
      title: header.modal.delete_data.title,
      content: header.modal.delete_data.content,
      okText: common.yes,
      cancelText: common.no,
      maskClosable: true,
      closable: true,
      onOk: async () => {
        modal.update({
          transitionName: '',
          maskTransitionName: '',
        })
        completeLogout(modal)
        runLoader('erasingDb', { containerProps: { style: { top: 0 } } })

        const db = await browserDBLoader.get()
        db.dropDB()
        db.disconnectNoAuthDB()

        stopLoaderById('erasingDb')
      },
      cancelButtonProps: {
        onClick: async () => {
          const db = await browserDBLoader.get()
          db.disconnectNoAuthDB()
          completeLogout(modal)
        },
      },
    })
  }

  return <StyledButton shape="circle" onClick={logout} icon={<LoginOutlined />} size="large" />
}

export default NoAuthLogoutButton
