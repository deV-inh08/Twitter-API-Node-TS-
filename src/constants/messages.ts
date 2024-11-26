const USERS_MESSAGE = {
  VALIDATION_ERROR: 'Validation error',
  NAME_IS_REQUIRED: 'Name is required',
  NAME_MUST_BE_A_STRING: 'Name must be a string',
  NAME_LENGTH_MUST_BE_FROM_1_TO_100: "Name length must be from 1 to 100",
  EMAIL_ALREADY_EXITS: 'Email already exits',
  EMAIL_IS_REQUIRED: 'Email is requied',
  EMAIL_IS_INVALID: 'Email is invalid',
  
  PASSWORD_IS_REQUIRED: 'Password is required',
  PASSWORD_MUST_BE_A_STRING: 'Password must be a string',
  PASSWORD_LENGHT_MUST_BE_FROM_6_TO_150: 'Password must be from 6 to 150',
  PASSWORD_MUST_BE_STRONG: 'Password must be 6-50 characters long and contain at least 1 lowercase letter,1 uppercase letter, 1 number, 1 symbol',
  CONFIRM_PASSWORD_IS_REQUIRED: 'Password is required',
  CONFIRM_PASSWORD_MUST_BE_A_STRING: 'Password must be a string',
  CONFIRM_PASSWORD_LENGHT_MUST_BE_FROM_6_TO_150: 'Password must be from 6 to 150',
  CONFIRM_PASSWORD_MUST_BE_STRONG: 'Password must be 6-50 characters long and contain at least 1 lowercase letter,1 uppercase letter, 1 number, 1 symbol',
  CONFIRM_PASSWORD_NOT_MATCH: 'Confirm password must be the same password',
  DATE_OF_BIRTH_MUST_BE_ISO8601: 'Date of birth is ISO8601'
} as const

export default USERS_MESSAGE