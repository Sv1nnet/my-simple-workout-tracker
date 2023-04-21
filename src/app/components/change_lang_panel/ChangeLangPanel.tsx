import { useAppDispatch, useAppSelector } from 'app/hooks'
import { FC, useRef, useState } from 'react'
import { changeLang, selectLang } from 'store/slices/config'
import { SelectorContainer, OptionsContainer } from './components/styled'
import { Lang } from 'store/slices/config/types'
import { Select } from 'antd'
import { TranslationOutlined } from '@ant-design/icons'
import { theme } from '@/src/styles/vars'

export interface IChangeLangPanel {
  className?: string;
  onChange?: Function;
}

const ChangeLangPanel: FC<IChangeLangPanel> = ({ className = '', onChange }) => {
  const [ isOpen, setIsOpen ] = useState(false)
  const $flagsContainer = useRef(null)
  const lang = useAppSelector(selectLang)
  const dispatch = useAppDispatch()

  const handleOpenSelect = () => {
    setIsOpen(_isOpen => !_isOpen)
  }

  const handleChangeLang = (_lang: Lang) => {
    dispatch(changeLang(_lang))
    if (onChange) onChange(_lang)
  }

  return (
    <SelectorContainer className={className} ref={$flagsContainer}>
      <label htmlFor="lang" style={{ cursor: 'pointer' }}>
        <TranslationOutlined style={{ fontSize: 24, marginRight: 6, color: theme.primaryColor }} />
      </label>
      <Select
        id="lang"
        showArrow={false}
        value={lang}
        open={isOpen}
        onClick={handleOpenSelect}
        onChange={handleChangeLang}
        dropdownRender={options => (
          <OptionsContainer>
            {options}
          </OptionsContainer>
        )}
        options={[
          {
            value: 'eng',
            label: <span style={{ paddingLeft: 12, paddingRight: 12 }}>EN</span>,
          },
          {
            value: 'ru',
            label: <span style={{ paddingLeft: 12, paddingRight: 12 }}>РУ</span>,
          },
        ]}
      />
    </SelectorContainer>
  )
}

export default ChangeLangPanel
