import styled from 'styled-components'

const FaceBody = styled.div`
  position: relative;
  margin: -50px auto 50px;
  width: 200px;
  height: 200px;
  border: 10px solid var(--primary-color);
  border-radius: 50%;
`
const FaceEyeContainer = styled.div`
  display: flex;
  justify-content: space-around;
  margin-top: 50px;
  padding: 0 10px;
`

const FaceEye = styled.div`
  width: 20px;
  height: 20px;
  background: var(--primary-color);
  border-radius: 50%;
`

const FaceMouth = styled.div`
  margin: auto;
  margin-top: 50px;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background: var(--primary-color);
`

const Face = () => (
  <FaceBody>
    <FaceEyeContainer>
      <FaceEye />
      <FaceEye />
    </FaceEyeContainer>
    <FaceMouth />
  </FaceBody>
)

export default Face
