import styled from 'styled-components'

export const FlagsContainer = styled.div`
  display: flex;
  position: absolute;
  right: 15px;
  top: 15px;
`

export const LangButton = styled.button`
  width: 42px;
  height: 30px;
  font-size: 40px;
  line-height: 0px;
  padding: 0;
  margin-left: 10px;
  border: none;
  background-color: transparent;
  &.active {
    background-color: skyblue;
  }
  &:focus {
    outline: 1px skyblue solid;
  }
`