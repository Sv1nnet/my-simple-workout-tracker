import styled from 'styled-components'

export const MainButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  position: fixed;
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
  width: ${({ $expanded }) => $expanded ? '140px' : '50px'};
  height: 40px;
  border-radius: 0 40px 40px 0;
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
