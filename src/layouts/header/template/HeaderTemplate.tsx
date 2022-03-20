import { FC, useContext } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { PageHeader } from 'antd'
import { useRouter } from 'next/router'
import { theme } from 'src/styles/vars'
import { NavTemplate } from 'layouts/nav'
import UserMenu from '../user_menu/UserMenu'
import { IntlContext } from '@/src/app/contexts/intl/IntContextProvider'
import { TabRoutes } from '../../nav/template/NavTemplate'

const StyledPageHeader = styled(PageHeader)`
  background-color: ${theme.primaryColor};
  .ant-page-header-heading-extra {
    margin: 0;
  }
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


const Header = ({ title, onBack, children }) => {
  const { intl } = useContext(IntlContext)

  return (
    <>
      <StyledPageHeader
        onBack={onBack}
        title={intl.header[title]}
        ghost={false}
        extra={<UserMenu />}
      />
      {children}
    </>
  )
}
Header.propTypes = {
  title: PropTypes.string,
  onBack: PropTypes.func,
  children: PropTypes.node,
}

export const HeaderTemplate: FC = ({ children }) => {
  const router = useRouter()

  const queryEntries = router.query ? Object.entries(router.query) : null
  const queryEntry = queryEntries && queryEntries.length > 0 ? queryEntries[queryEntries.length - 1][1] : null
  let _title = (queryEntry ?? router.pathname) as string || 'activities'
  if (_title.startsWith('/')) _title = _title.substring(1)

  return (
    <Header onBack={router.back} title={_title}>
      {children}
    </Header>
  )
}

HeaderTemplate.propTypes = {
  children: PropTypes.node,
}

const HeaderTemplateWithNav: FC<{ route: TabRoutes }> = ({ children, route }) => {
  const router = useRouter()
  const _title = route ?? ((router.route) || 'activities').replace('/', '') as TabRoutes

  return (
    <>
      <Header onBack={router.back} title={_title}>
        <NavTemplate activeTab={_title} />
        {children}
      </Header>
    </>
  )
}

export default HeaderTemplateWithNav
