import React from 'react'
import MainTemplate from '../main_template/MainTemplate'

const WorkoutTemplate = ({ children, workout, error }) => (
  <MainTemplate tab="workouts">
    {React.cloneElement(children, { ...children.props, workout, error })}
  </MainTemplate>
)

WorkoutTemplate.defaultProps = {
  exercise: null,
}

export default WorkoutTemplate
