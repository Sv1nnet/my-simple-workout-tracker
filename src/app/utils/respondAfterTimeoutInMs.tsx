import { IResponse } from '../constants/response_types'

export class Timeout {
  private _timeout: number

  constructor(timeout = null) {
    this._timeout = timeout
  }

  getTimeout() {
    return this._timeout
  }

  setTimeout(...params: Parameters<typeof setTimeout>) {
    this._timeout = setTimeout.apply(null, params)
    return this._timeout
  }

  clearTimeout() {
    clearTimeout(this._timeout)
  }
}

const respondAfterTimeoutInMs = ({ timeout, ctx, route }, timeToWait = 1000) => {
  clearTimeout(timeout.getTimeout)

  return new Promise<IResponse<null>>(async (res, rej) => {
    // if server response longer then 1s then we return
    // data so a user won't wait for response too long
    timeout.setTimeout(() => {
      res({
        error: null,
        data: null,
        success: true,
      })
    }, timeToWait)

    try {
      const response = await fetch(route, {
        headers: {
          Authorization: `Bearer ${ctx.req.session.token}`,
        },
      }).then((r) => {
        timeout.clearTimeout()
        return r.json()
      })

      res(response)
    } catch (error) {
      rej(error)
    }
  })
}

export default respondAfterTimeoutInMs
