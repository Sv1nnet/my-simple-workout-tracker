import React from 'react'
import MainTemplate from '../main_template/MainTemplate'

const ExerciseTemplate = ({ children, exercise, error }) => (
  <MainTemplate tab="exercises">
    {React.cloneElement(children, { ...children.props, exercise, error })}
  </MainTemplate>
)

ExerciseTemplate.defaultProps = {
  exercise: null,
}

export default ExerciseTemplate
