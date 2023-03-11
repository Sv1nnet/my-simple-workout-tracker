import styled from 'styled-components'
import Image from 'next/image'
import { Select } from 'antd'
import { changeLang, selectLang } from 'store/slices/config'
import { useAppDispatch, useAppSelector } from 'app/hooks'
import UserMenu from 'layouts/header/user_menu/UserMenu'
import { configApi } from '@/src/app/store/slices/config/api'
import { Lang } from '@/src/app/store/slices/config/types'

const Wrapper = styled.div`
  position: absolute;
  left: 0;
  display: flex;
  align-items: center;
  width: 100%;

  .ant-select {
    margin-left: 14px;

    .ant-select-selector {
      padding-left: 2px;
      padding-right: 2px;

      .ant-select-selection-item {
        margin-top: 2px;
      }
    }
  }
`

const OptionsContainer = styled.div`
  & .ant-select-item.ant-select-item-option {
    padding: 0;

    .ant-select-item-option-content {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
`

const Content = () => {
  const lang = useAppSelector(selectLang)
  const dispatch = useAppDispatch()
  const [ updateConfig ] = configApi.useLazyUpdateQuery()

  const updateLang = (_lang: Lang) => {
    dispatch(changeLang(_lang))
    updateConfig({ config: { lang: _lang } })
  }

  return (
    <Wrapper>
      <UserMenu />
      <Select
        showArrow={false}
        value={lang}
        onChange={updateLang}
        dropdownRender={options => (
          <OptionsContainer>
            {options}
          </OptionsContainer>
        )}
        options={[
          {
            value: 'eng',
            label: <Image src="/icons/usa_flag.svg" alt="" width={38} height={26} />,
          },
          {
            value: 'ru',
            label: <Image src="/icons/ru_flag.svg" alt="" width={38} height={26} />,
          },
        ]}
      />
    </Wrapper>
  )
}

export default Content
