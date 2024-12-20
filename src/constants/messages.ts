const USERS_MESSAGE = {
  VALIDATION_ERROR: 'Validation error',

  NAME_IS_REQUIRED: 'Name is required',
  NAME_MUST_BE_A_STRING: 'Name must be a string',
  NAME_LENGTH_MUST_BE_FROM_1_TO_100: "Name length must be from 1 to 100",

  EMAIL_ALREADY_EXITS: 'Email already exits',
  EMAIL_IS_REQUIRED: 'Email is requied',
  EMAIL_IS_INVALID: 'Email is invalid',
  EMAIL_OR_PASSWORD_INCORRECT: 'Email or password is incorrect',

  PASSWORD_IS_REQUIRED: 'Password is required',
  PASSWORD_MUST_BE_A_STRING: 'Password must be a string',
  PASSWORD_LENGHT_MUST_BE_FROM_6_TO_150: 'Password must be from 6 to 150',
  PASSWORD_MUST_BE_STRONG: 'Password must be 6-50 characters long and contain at least 1 lowercase letter,1 uppercase letter, 1 number, 1 symbol',
  
  CONFIRM_PASSWORD_IS_REQUIRED: 'Password is required',
  CONFIRM_PASSWORD_MUST_BE_A_STRING: 'Password must be a string',
  CONFIRM_PASSWORD_LENGHT_MUST_BE_FROM_6_TO_150: 'Password must be from 6 to 150',
  CONFIRM_PASSWORD_MUST_BE_STRONG: 'Password must be 6-50 characters long and contain at least 1 lowercase letter,1 uppercase letter, 1 number, 1 symbol',
  CONFIRM_PASSWORD_NOT_MATCH: 'Confirm password must be the same password',
  
  DATE_OF_BIRTH_MUST_BE_ISO8601: 'Date of birth is ISO8601',
  
  LOGIN_SUCCESS: 'Login successfully',
  REGISTER_SUCCESS: 'Register successfully',
  LOGOUT_SUCCESS: "logout successfully",


  ACCESS_TOKEN_IS_REQUIRED: 'Access token is required',
  REFRESH_TOKEN_IS_REQUIRED: 'Refresh token is required',
  REFRESH_TOKEN_IS_INVALID: 'Refresh token is invalid',

  USED_REFRESH_TOKEN_OR_NOT_EXITS: 'Used refresh token or not exits',

  EMAIL_VERIFY_TOKEN_IS_REQUIRED: 'Email verify token is required',
  EMAIL_ALREADY_VERIFIED_BEFORE: 'Email already verified before',
  EMAIL_VERIFY_SUCCESS: 'Email verify success',

  USER_NOT_FOUND: 'User not found',
  USER_NOT_VERIFIED: 'User not verified',

  RESEND_VERIFY_EMAIL_SUCCESS: 'Resend verify email success',

  CHECK_EMAIL_TO_RESET_PASSWORD: 'Check email to reset password',

  FORGOT_PASSWORD_TOKEN_IS_REQUIRED: 'Fotgot password token is required',
  FORGOT_PASSWORD_TOKEN_INVALID: 'Forgot password token invalid',

  VERIFY_FORGOT_PASSWORD_SUCCESS: 'Verify forgot password success',

  GET_MY_PROFILE_SUCCESS: 'Get my profile success',

  BIO_MUST_BE_A_STRING: 'Bio must be a string',
  BIO_LENGTH_MUST_BE_FROM_1_TO_200: 'Bio length must be from 1 to 200',

  LOCATION_MUST_BE_A_STRING: 'Location must be a string',
  LOCATION_LENGTH: 'Location length must be from 1 to 200',

  WEBSITE_MUST_BE_A_STRING: "Website must be a string",
  WEBSITE_LENGTH: 'Website length must be from 1 to 200',

  USERNAME_MUST_BE_A_STRING: 'Username must be a string',
  USERNAME_LENGTH: 'Username must be from 1 to 100',
  USERNAME_INVALID: 'Username must be 4-15 characters long and contain only letters, numbers, underscores, not only numbers',
  USERNAME_EXISTED: 'Username exists',

  IMAGE_URL_MUST_BE_A_STRING: 'Image URL must be a string',
  IMAGE_URL_LENGTH: 'Image URL must be from 1 to 200',

  UPDATE_ME_SUCCESS: "Update me success",

  FOLLOW_SUCCESS: 'Follow success',

  FOLLOWED: "Follwed",

  INVALID_USER_ID: "Invalid user id",

  ALREADY_UNFOLLOWED: "Already unfollowed",

  UNFOLLOW_SUCCESSS: "Unfollow success",

  OLD_PASSWORD_NOT_MATCH: 'Old password not match',

  CHANGE_PASSWORD_SUCCESS: 'Change password success',

  UPLOAD_SUCCESS: 'Upload success'

} as const

export default USERS_MESSAGE