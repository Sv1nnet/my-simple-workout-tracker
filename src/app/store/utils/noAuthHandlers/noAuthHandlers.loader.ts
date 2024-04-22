import { Handlers } from 'app/store/utils/noAuthHandlers'

export type NoAuthHandlersLoader = {
  handlers: Handlers | null,
  get: () => Promise<Handlers>,
}

const noAuthHandlersLoader: NoAuthHandlersLoader = {
  handlers: null,
  async get() {
    if (!this.handlers) {
      this.handlers = (await import('app/store/utils/noAuthHandlers')).default
    }
    return this.handlers
  },
}

export default noAuthHandlersLoader
