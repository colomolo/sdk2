const request = require('request-promise-native')

const ApiError = require('./ApiError')

const throwApiError = (e) => {
  throw new ApiError(e)
}

const authenticate = (host, { username, password }) => {
  return request({
    method: 'POST',
    uri: `${host}/v1/authenticate`,
    auth: {
      username,
      password,
    },
    json: true,
  })
}

class Api {
  constructor(host) {
    this.host = host
  }

  async getAllPayments(credentials) {
    try {
      const token = await authenticate(this.host, credentials)

      return request({
        uri: `${this.host}/v1/payments`,
        auth: {
          bearer: token.authToken,
        },
        json: true,
      })
        .catch(throwApiError)
    } catch (e) {
      throwApiError(e)
    }
  }

  async getPayment(credentials, id) {
    try {
      const token = await authenticate(this.host, credentials)

      return request({
        uri: `${this.host}/v1/payments/${id}`,
        auth: {
          bearer: token.authToken,
        },
        json: true,
      })
        .catch(throwApiError)
    } catch (e) {
      throwApiError(e)
    }
  }

  async createPayment(credentials, payment) {
    try {
      const token = await authenticate(this.host, credentials)

      return request({
        method: 'POST',
        uri: `${this.host}/v1/payments`,
        auth: {
          bearer: token.authToken,
        },
        body: payment,
        json: true,
      })
        .catch(throwApiError)
    } catch (e) {
      throwApiError(e)
    }
  }

  async approvePayment(credentials, id) {
    try {
      const token = await authenticate(this.host, credentials)

      return request({
        method: 'PUT',
        uri: `${this.host}/v1/payments/${id}/approve`,
        auth: {
          bearer: token.authToken,
        },
        json: true,
      })
        .then(() => true)
        .catch(throwApiError)
    } catch (e) {
      throwApiError(e)
    }
  }

  async cancelPayment(credentials, id) {
    try {
      const token = await authenticate(this.host, credentials)

      return request({
        method: 'PUT',
        uri: `${this.host}/v1/payments/${id}/cancel`,
        auth: {
          bearer: token.authToken,
        },
        json: true,
      })
        .then(() => true)
        .catch(throwApiError)
    } catch (e) {
      throwApiError(e)
    }
  }
}

module.exports = Api
