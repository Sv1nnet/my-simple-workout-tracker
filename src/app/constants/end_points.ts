import getConfig from 'next/config'

const isServerEnv = typeof window === 'undefined'
const isProd = getConfig().publicRuntimeConfig.__IS_PROD__
let host = getConfig().publicRuntimeConfig.__API_HOST__

if (isProd) {
  host = isServerEnv ? process.env.INTERNAL_API_HOST : getConfig().publicRuntimeConfig.__API_HOST__
}

export const BASE_URL = `${host}/api`

// eslint-disable-next-line @typescript-eslint/naming-convention
const _global = !isServerEnv ? window : global
_global.__API__ = _global.__API__ ?? {}
_global.__API__.BASE_URL = _global.__API__.BASE_URL ?? BASE_URL

export type BaseRouteUnit = {
  full: string,
  short: string,
}

const routes = {
  get base() {
    return _global.__API__.BASE_URL
  },
  auth: {
    v1: {
      get base() {
        return {
          full: `${_global.__API__.BASE_URL}/v1/auth`,
          path: '/v1/auth',
        }
      },
      get login() {
        return {
          full: `${routes.base}${this.base.path}/login`,
          path: `${this.base.path}/login`,
        }
      },
      get signup() {
        return {
          full: `${routes.base}${this.base.path}/signup`,
          path: `${this.base.path}/signup`,
        }
      },
      get verifySignupCode() {
        return {
          full: `${routes.base}${this.base.path}/verify-signup-code`,
          path: `${this.base.path}/verify-signup-code`,
        }
      },
      get logout() {
        return {
          full: `${routes.base}${this.base.path}/logout`,
          path: `${this.base.path}/logout`,
        }
      },
      get resetPassword() {
        return {
          full: `${routes.base}${this.base.path}/reset-password`,
          path: `${this.base.path}/reset-password`,
        }
      },
      get restorePassword() {
        return {
          full: `${routes.base}${this.base.path}/restore-password`,
          path: `${this.base.path}/restore-password`,
        }
      },
      get refresh() {
        return {
          full: `${routes.base}${this.base.path}/token/refresh`,
          path: `${this.base.path}/token/refresh`,
        }
      },
    },
  },
  profile: {
    v1: {
      get base() {
        return {
          full: `${_global.__API__.BASE_URL}/v1/profile`,
          path: '/v1/profile',
        }
      },
      get update() {
        return {
          full: `${routes.base}${this.base.path}/update`,
          path: `${this.base.path}/update`,
        }
      },
    },
  },
  config: {
    v1: {
      get base() {
        return {
          full: `${_global.__API__.BASE_URL}/v1/config`,
          path: '/v1/config',
        }
      },
      get update() {
        return {
          full: `${routes.base}${this.base.path}/update`,
          path: `${this.base.path}/update`,
        }
      },
    },
  },
  exercise: {
    v1: {},
  },
  workout: {
    v1: {},
  },
  activity: {
    v1: {},
  },
}

const createBaseRoutes = (base: string) => ({
  get base() {
    return {
      full: `${_global.__API__.BASE_URL}/v1/${base}`,
      path: `/v1/${base}`,
    }
  },
  get list() {
    return {
      full: `${routes.base}${this.base.path}/list`,
      path: `${this.base.path}/list`,
    }
  },
  get create() {
    return {
      full: `${routes.base}${this.base.path}/create`,
      path: `${this.base.path}/create`,
    }
  },
  get update() {
    return {
      full: `${routes.base}${this.base.path}/update`,
      path: `${this.base.path}/update`,
    }
  },
  get delete() {
    return {
      full: `${routes.base}${this.base.path}/delete`,
      path: `${this.base.path}/delete`,
    }
  },
  get copy() {
    return {
      full: `${routes.base}${this.base.path}/copy`,
      path: `${this.base.path}/copy`,
    }
  },
})

routes.exercise = { v1: createBaseRoutes('exercise') }
routes.workout = { v1: createBaseRoutes('workout') }
routes.activity = {
  v1: {
    ...createBaseRoutes('activity'),
    get history() {
      return {
        full: `${routes.base}${this.base.path}/history`,
        path: `${this.base.path}/history`,
      }
    },
  },
}

export default routes as typeof routes & {
  exercise: {
    v1: ReturnType<typeof createBaseRoutes>
  },
  workout: {
    v1: ReturnType<typeof createBaseRoutes>
  },
  activity: {
    v1: ReturnType<typeof createBaseRoutes> & { history: BaseRouteUnit }
  },
}
