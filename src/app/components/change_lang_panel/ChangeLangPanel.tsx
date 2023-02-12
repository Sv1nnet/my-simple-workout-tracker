import Image from 'next/image'
import { useAppDispatch, useAppSelector } from 'app/hooks'
import { FC, SyntheticEvent, useRef } from 'react'
import { changeLang, selectLang } from 'store/slices/config'
import { FlagsContainer, LangButton } from './components/styled'

export interface IChangeLangPanel {
  className?: string;
  onChange?: Function;
}

const ChangeLangPanel: FC<IChangeLangPanel> = ({ className = '', onChange }) => {
  const $flagsContainer = useRef(null)
  const lang = useAppSelector(selectLang)
  const dispatch = useAppDispatch()

  const handleChangeLang = (e: SyntheticEvent<HTMLButtonElement>) => {
    const { dataset } = e.currentTarget as HTMLButtonElement
    dispatch(changeLang(dataset.lang))
    if (onChange) onChange(dataset.lang)
  }

  return (
    <FlagsContainer className={className} ref={$flagsContainer}>
      <LangButton className={lang === 'eng' ? 'active' : ''} type="button" data-lang="eng" onClick={handleChangeLang}>
        <Image src="/icons/usa_flag.svg" alt="" width={38} height={26} />
      </LangButton>
      <LangButton className={lang === 'ru' ? 'active' : ''} type="button" data-lang="ru" onClick={handleChangeLang}>
        <Image src="/icons/ru_flag.svg" alt="" width={38} height={26} />
      </LangButton>
    </FlagsContainer>
  )
}

export default ChangeLangPanel
