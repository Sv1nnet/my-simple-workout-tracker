import styled from 'styled-components'

export const MainButtonContainer = styled.div<{ $expanded?: boolean }>`
  display: flex;
  justify-content: flex-end;
  position: absolute;
  bottom: 12px;
  right: 15px;
  height: 40px;
  width: ${({ $expanded }) => $expanded ? '100%' : '40px'};
  overflow: ${({ $expanded }) => $expanded ? 'hidden' : 'visible'};
  transition: .3s all;
  border-radius: 40px;
`

export const CreateButtonContainer = styled.div<{ $expanded?: boolean }>`
  border-radius: 40px;
  overflow: hidden;
  width: 40px;
`

export const MoreOptionsButtonContainer = (() => {
  const Component = styled.div<{ $expanded?: boolean, $items?: number }>`
    display: flex;
    justify-content: right;
    position: absolute;
    top: 0;
    transition: .3s all;
    overflow: hidden;
    width: ${({ $expanded, $items }) => $expanded ? `${90 + ($items * 50)}` : '0'}px;
    height: 40px;
    border-radius: 40px 40px 40px 40px;
  `

  const Inner = styled.div`
    display: flex;
    position: absolute;
    width: 100%;
    transition: .3s all;
    border-radius: 0 40px 40px 0;
  `

  const _MoreOptionsButtonContainer: typeof Component & { Inner: typeof Inner } = Object.assign(Component, { Inner })

  return _MoreOptionsButtonContainer
})()


export const MoreOptionsButton = styled.button`
  background: none;
  border: none;
  height: 40px;
`
