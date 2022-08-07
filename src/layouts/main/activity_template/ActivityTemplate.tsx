import React from 'react'
import MainTemplate from '../main_template/MainTemplate'

const ActivityTemplate = ({ children, workout, error }) => (
  <MainTemplate tab="workouts">
    {React.cloneElement(children, { ...children.props, workout, error })}
  </MainTemplate>
)

ActivityTemplate.defaultProps = {
  exercise: null,
}

export default ActivityTemplate
