import { useActivityInProgressContext } from 'app/contexts/activity/ActivityInProgressContextProvider'
import { ActivityDurationInput } from './components'
import { useAppSelector } from 'app/hooks'
import { ACTIVITY_PAGE_TYPE, selectPageInfo } from 'app/store/slices/activity'
import './Header.scss'

export type HeaderProps = {
  title: React.ReactNode
}

const Header = ({ title }: HeaderProps) => {
  const { activity } = useActivityInProgressContext()
  const { pageType } = useAppSelector(selectPageInfo)

  const isActivityInProgress = Boolean(activity?.isRunning || activity?.isPaused)
  const showHeaderTimer = pageType === ACTIVITY_PAGE_TYPE.CREATE
    || (pageType !== ACTIVITY_PAGE_TYPE.EDIT && isActivityInProgress)

  if (showHeaderTimer) {
    return (<ActivityDurationInput />)
  }

  return title as JSX.Element
}

export default Header
