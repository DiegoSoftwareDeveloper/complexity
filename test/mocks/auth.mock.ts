import { getRandomNumber } from '../helpers'

export const loginData = {
  valid: {
    email: 'oscarfamado@gmail.com',
    password: 'oscar123',
  },
  invalid: {
    email: 'oscarfamado1@gmail.com',
    password: '1234141123123',
  },
}

export const registerData = {
  valid: {
    firstName: `test ${getRandomNumber()}`,
    lastName: `test ${getRandomNumber()}`,
    email: `test_${getRandomNumber()}@gmail.com`,
    password: `test_${getRandomNumber()}`,
  },
  invalid: {
    firstName: `test ${getRandomNumber()}`,
    lastName: `test ${getRandomNumber()}`,
    password: `test_${getRandomNumber()}`,
  },
  validStatic: {
    firstName: 'Alejandro',
    lastName: 'Franco',
    email: 'alejandro.franco@draketech.ca',
    password: 'password',
  },
}

export const forgotPasswordData = {
  valid: {
    email: `test_${getRandomNumber()}@gmail.com`,
  },
  invalid: {},
}
