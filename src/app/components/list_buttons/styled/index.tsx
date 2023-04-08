import styled from 'styled-components'

export const MainButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  position: absolute;
  bottom: 15px;
  right: 15px;
  height: 40px;
  width: 40px;
  border-radius: 40px;
`

export const MoreOptionsButtonContainer = styled.div`
  display: flex;
  justify-content: right;
  position: absolute;
  top: 0;
  transition: .3s all;
  overflow: hidden;
  width: ${({ $expanded, $items }) => $expanded ? `${90 + ($items * 50)}` : '50'}px;
  height: 40px;
  border-radius: 40px 40px 40px 40px;
`
MoreOptionsButtonContainer.Inner = styled.div`
  display: flex;
  position: absolute;
  width: 40px;
  transition: .3s all;
  border-radius: 0 40px 40px 0;
`

export const MoreOptionsButton = styled.button`
  background: none;
  border: none;
  height: 40px;
`
