import Image from 'next/image'
import { useAppDispatch, useAppSelector } from 'app/hooks'
import { FC, SyntheticEvent, useEffect, useRef } from 'react'
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

  useEffect(() => {
    // I have to use this crutch
    // since ssr for some reason refuses set
    // correct class with selected language
    // to the buttons (on profile page)
    // after lang settings downloaded
    // on the client side
    if ($flagsContainer.current) {
      const [ eng, ru ] = $flagsContainer.current.children
      if (lang === 'eng') {
        eng.classList.add('active')
        ru.classList.remove('active')
      } else {
        ru.classList.add('active')
        eng.classList.remove('active')
      }
    }
  }, [ lang ])

  return (
    <FlagsContainer className={className} ref={$flagsContainer}>
      <LangButton type="button" data-lang="eng" onClick={handleChangeLang}>
        <Image src="/icons/usa_flag.svg" alt="" width={38} height={26} />
      </LangButton>
      <LangButton type="button" data-lang="ru" onClick={handleChangeLang}>
        <Image src="/icons/ru_flag.svg" alt="" width={38} height={26} />
      </LangButton>
    </FlagsContainer>
  )
}

export default ChangeLangPanel
