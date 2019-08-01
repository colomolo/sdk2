const parseRequestError = (message) => {
  try {
    return JSON.parse(message.match(/{.*}/i)[0])
  } catch (e) {
    return { code: 'ERR_UNKNOWN', message: 'Unknown error' }
  }
}

class ApiError extends Error {
  constructor(args) {
    super(args)

    Error.captureStackTrace(this, ApiError)

    const meta = parseRequestError(args.message)

    this.name = 'ApiError'
    this.code = meta.code
    this.message = meta.message
    this.details = meta.details
  }
}

module.exports = ApiError
