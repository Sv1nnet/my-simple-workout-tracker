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

export const BASE_ROUTES = {
  PROFILE: '/profile',
  EXERCISES: '/exercises',
  WORKOUTS: '/workouts',
  ACTIVITIES: '/activities',
  NOT_FOUND: '/404',
}

const createRoute = (path: string) => (id: string | null = null) => (query?: string) => query ? `${path}?${query}` : `${path}/${id ?? ':id'}`

export const routes = {
  profile: {
    path: () => BASE_ROUTES.PROFILE,
  },
  exercises: {
    item: createRoute(BASE_ROUTES.EXERCISES),
    create: createRoute(BASE_ROUTES.EXERCISES)('create'),
    list: () => BASE_ROUTES.EXERCISES,
  },
  workouts: {
    item: createRoute(BASE_ROUTES.WORKOUTS),
    create: createRoute(BASE_ROUTES.WORKOUTS)('create'),
    list: () => BASE_ROUTES.WORKOUTS,
  },
  activities: {
    item: createRoute(BASE_ROUTES.ACTIVITIES),
    create: createRoute(BASE_ROUTES.ACTIVITIES)('create'),
    list: () => BASE_ROUTES.ACTIVITIES,
  },
  notFound: {
    path: () => BASE_ROUTES.NOT_FOUND,
  },
}

const RootRouter = () => (
  <RootProvider>
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path={routes.exercises.create()} element={<CreateExercise />} />
          <Route path={routes.exercises.item()()} element={<ExerciseItem />} />
          <Route path={routes.exercises.list()} element={<Exercises />} />

          <Route path={routes.workouts.create()} element={<CreateWorkout />} />
          <Route path={routes.workouts.item()()} element={<WorkoutItem />} />
          <Route path={routes.workouts.list()} element={<Workouts />} />

          {[ '/', BASE_ROUTES.ACTIVITIES ].map(path => (
            <React.Fragment key={path}>
              <Route path={createRoute(path)('create')()} element={<CreateActivity />} />
              <Route path={createRoute(path)()()} element={<ActivityItem />} />
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