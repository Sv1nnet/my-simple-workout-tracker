import { Route, BrowserRouter, Routes } from 'react-router-dom'
import RootProvider from 'app/contexts/root'
import { AuthLayout } from 'layouts/authorization'
import NotFound404 from 'pages/404'
import CreateWorkout from 'pages/workouts/Create'
import Workouts from 'pages/workouts/List'
import WorkoutItem from 'pages/workouts/Item'
import CreateExercise from 'pages/exercises/Create'
import ExerciseItem from 'pages/exercises/Item'
import Exercises from 'pages/exercises/List'
import CreateActivity from 'pages/activities/Create'
import ActivityItem from 'pages/activities/Item'
import Activities from 'pages/activities/List'
import React from 'react'
import Profile from 'pages/Profile'

export const ROUTES = {
  PROFILE: '/profile',
  EXERCISES: '/exercises',
  WORKOUTS: '/workouts',
  ACTIVITIES: '/activities',
  NOT_FOUND: '/404',
}

const RootRouter = () => (
  <RootProvider>
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path={`${ROUTES.EXERCISES}/create`} element={<CreateExercise />} />
          <Route path={`${ROUTES.EXERCISES}/:id`} element={<ExerciseItem />} />
          <Route path={ROUTES.EXERCISES} element={<Exercises />} />

          <Route path={`${ROUTES.WORKOUTS}/create`} element={<CreateWorkout />} />
          <Route path={`${ROUTES.WORKOUTS}/:id`} element={<WorkoutItem />} />
          <Route path={ROUTES.WORKOUTS} element={<Workouts />} />

          {[ '/', ROUTES.ACTIVITIES ].map(path => (
            <React.Fragment key={path}>
              <Route path={`${path}/create`} element={<CreateActivity />} />
              <Route path={`${path}/:id`} element={<ActivityItem />} />
              <Route path={path} element={<Activities />} />
            </React.Fragment>
          ))}

          <Route path="/profile" element={<Profile />}/>

          <Route path="*" element={<NotFound404 />}/>
        </Route>
      </Routes>
    </BrowserRouter>
  </RootProvider>
)

export default RootRouter