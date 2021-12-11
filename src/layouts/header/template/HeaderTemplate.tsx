import PropTypes from 'prop-types'
import styled from 'styled-components'
import { PageHeader } from 'antd'
import { useRouter } from 'next/router'
import int from 'constants/int.json'
import { useAppSelector } from 'app/hooks'
import { theme } from 'src/styles/vars'
import { NavTemplate } from 'layouts/nav'
import { FC } from 'react'

const StyledPageHeader = styled(PageHeader)`
  background-color: ${theme.primaryColor};
  .ant-page-header-heading {
    justify-content: center;
    .ant-page-header-back {
      position: absolute;
      left: 15px;
    }
  }
  .ant-page-header-heading-title {
    color: white;
  }
  .anticon.anticon-arrow-left > svg {
    transform: scale(1.5);
    fill: white;
  }
`

export const HeaderTemplate: FC = ({ children }) => {
  const router = useRouter()
  const { lang }  = useAppSelector(state => state.config)

  const queryEntries = router.query ? Object.entries(router.query) : null
  const queryEntry = queryEntries ? queryEntries[queryEntries.length - 1][1] : null
  const _title = (queryEntry ?? router.pathname) as string || 'activities'

  return (
    <>
      <StyledPageHeader onBack={router.back} title={int.header[_title]?.[lang]} ghost={false} />
      {children}
    </>
  )
}

HeaderTemplate.propTypes = {
  children: PropTypes.node,
}

const HeaderTemplateWithNav: FC = ({ children }) => {
  const router = useRouter()
  const { lang }  = useAppSelector(state => state.config)
  const _title = (router.query.main as 'exercises' | 'workouts' | 'activities') || 'activities'

  return (
    <>
      <StyledPageHeader onBack={router.back} title={int.header[_title]?.[lang]} ghost={false} />
      <NavTemplate activeTab={_title} />
      {children}
    </>
  )
}

HeaderTemplateWithNav.propTypes = {
  children: PropTypes.node,
}

export default HeaderTemplateWithNav
