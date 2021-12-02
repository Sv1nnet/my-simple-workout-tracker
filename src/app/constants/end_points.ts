export const BASE_URL = 'http://192.168.0.14:3005/api'

// eslint-disable-next-line @typescript-eslint/naming-convention
let _global
try {
  _global = window
} catch {
  _global = global
}
_global.__API__ = _global.__API__ ?? {}
_global.__API__.BASE_URL = _global.__API__.BASE_URL ?? BASE_URL

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
          full: `${routes.base}${this.base.path}/token/access`,
          path: `${this.base.path}/token/access`,
        }
      },
    },
  },
}

export default routes
