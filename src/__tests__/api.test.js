const nock = require('nock')

const Api = require('../../index')
const payments = require('../fixtures/payments')

const HOST = 'http://third-party-payments-service.com'

const api = new Api(HOST)

const credentials = {
  username: 'serious_business',
  password: 'suchPassw0rdSecure',
}

const nockAuthenticate = () => {
  nock(HOST)
    .post('/v1/authenticate')
    .reply(200, {
      'authToken': 'fJizPj8LxL3eKOy1GEIMPcdPQqgxN42oprukdHLu8jgbV',
      'expiresIn': '2017-01-22T11:26:14.805Z',
    })
}

afterEach(nock.cleanAll)

describe('Payments list', () => {
  test('GET /v1/payments returns payments array', async () => {
    nockAuthenticate()

    nock(HOST)
      .get('/v1/payments')
      .reply(200, payments)

    const responseJSON = await api.getAllPayments(credentials)

    expect(responseJSON.length).toEqual(payments.length)
  })

  test('GET /v1/payments without credentials throws error', async () => {
    nock(HOST)
      .post('/v1/authenticate')
      .reply(401, {
        'code': 'ERR_UNATHORIZED',
        'message': 'No auth token provided',
      })

    expect.assertions(1)

    try {
      await api.getAllPayments({ username: '', password: '' })
    } catch (e) {
      expect(e.code).toEqual('ERR_UNATHORIZED')
    }
  })
})

test('GET /v1/payments/:id returns payment', async () => {
  const id = 1
  const payment = payments.find(payment => payment.id === id.toString())

  nockAuthenticate()

  nock(HOST)
    .get(`/v1/payments/${id}`)
    .reply(200, payment)

  const responseJSON = await api.getPayment(credentials, id)

  expect(responseJSON).toMatchObject(payment)
})

test('POST /v1/payments creates payment', async () => {
  const id = 1
  const payment = payments.find(payment => payment.id === id.toString())

  nockAuthenticate()

  nock(HOST)
    .post('/v1/payments')
    .reply(200, payment)

  const responseJSON = await api.createPayment(credentials, payment)

  expect(responseJSON).toMatchObject(payment)
})

describe('Approval', () => {
  test('PUT /v1/payments/:id/approve approves payment', async () => {
    const id = 1

    nockAuthenticate()

    nock(HOST)
      .put(`/v1/payments/${id}/approve`)
      .reply(200)

    const response = await api.approvePayment(credentials, id)

    expect(response).toBeTruthy()
  })

  test('PUT /v1/payments/:id/approve of cancelled payment throws error', async () => {
    const id = 1

    nockAuthenticate()

    nock(HOST)
      .put(`/v1/payments/${id}/approve`)
      .reply(400, {
        'code': 'ERR_CANNOT_APPROVE',
        'message': 'Cannot approve a payment that has already been cancelled',
      })

    expect.assertions(1)

    try {
      await api.approvePayment(credentials, id)
    } catch (e) {
      expect(e.code).toEqual('ERR_CANNOT_APPROVE')
    }
  })
})

describe('Cancellation', () => {
  test('PUT /v1/payments/:id/cancel cancels payment', async () => {
    const id = 1

    nockAuthenticate()

    nock(HOST)
      .put(`/v1/payments/${id}/cancel`)
      .reply(200)

    const response = await api.cancelPayment(credentials, id)

    expect(response).toBeTruthy()
  })

  test('PUT /v1/payments/:id/cancel of approved payment throws error', async () => {
    const id = 1

    nockAuthenticate()

    nock(HOST)
      .put(`/v1/payments/${id}/cancel`)
      .reply(400, {
        'code': 'ERR_CANNOT_CANCEL',
        'message': 'Cannot cancel a payment that has already been approved',
      })

    try {
      await api.cancelPayment(credentials, id)
    } catch (e) {
      expect(e.code).toEqual('ERR_CANNOT_CANCEL')
    }
  })
})
