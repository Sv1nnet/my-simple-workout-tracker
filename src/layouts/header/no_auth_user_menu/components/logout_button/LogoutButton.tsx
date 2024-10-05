import { Button, Modal } from 'antd'
import { logoutWithNoAuth, selectIsNoAuthLogin } from 'app/store/slices/auth'
import { useAppDispatch, useAppSelector } from 'app/hooks'
import { useIntlContext } from 'app/contexts/intl/IntContextProvider'
import { useAppLoaderContext } from 'app/contexts/loader/AppLoaderContextProvider'
import browserDBLoader from 'app/store/utils/BrowserDB/browserDB.loader'
import { resetListState as resetExerciseListState } from 'app/store/slices/exercise'
import { resetListState as resetWorkoutListState } from 'app/store/slices/workout'
import { resetListState as resetActivityListState } from 'app/store/slices/activity'
import { Link } from 'react-router-dom'
import { MouseEventHandler } from 'react'

export type LogoutButtonProps = {
  onClick: MouseEventHandler<HTMLElement>
}

const LogoutButton = ({ onClick }) => {
  const isNoAuthLogin = useAppSelector(selectIsNoAuthLogin)
  const { intl: { common, header, pages } } = useIntlContext()
  const dispatch = useAppDispatch()
  const { runLoader, stopLoaderById } = useAppLoaderContext()

  const logout = () => {
    onClick?.()

    function completeLogout(modal: ReturnType<typeof Modal.confirm>) {
      modal.destroy()
      dispatch(logoutWithNoAuth())
      dispatch(resetExerciseListState())
      dispatch(resetWorkoutListState())
      dispatch(resetActivityListState())
    }

    const modal = Modal.confirm({
      title: header.modal.delete_data.title,
      content: header.modal.delete_data.content,
      okText: common.yes,
      cancelText: common.no,
      maskClosable: true,
      closable: true,
      okButtonProps: {
        danger: true,
      },
      onOk: async () => {
        modal.update({
          transitionName: '',
          maskTransitionName: '',
        })
        completeLogout(modal)
        runLoader('erasingDb', { containerProps: { style: { top: 0 } } })

        const db = await browserDBLoader.get()
        db.dropDB()
        db.disconnect()

        stopLoaderById('erasingDb')
      },
      cancelButtonProps: {
        onClick: async () => {
          const db = await browserDBLoader.get()
          db.disconnect()
          completeLogout(modal)
        },
      },
    })
  }

  return (
    <Button type="link" block onClick={logout}>
      {isNoAuthLogin ? pages.profile.logout : <Link to={'/'}>{pages.profile.logout}</Link>}
    </Button>
  )
}

export default LogoutButton
