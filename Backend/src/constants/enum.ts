export enum UserVerifyStatus {
  Unverified,
  Verified,
  Banned,
}

export enum TokenType {
  AccessToken,
  RefreshToken,
  FotgotPasswordToken,
  EmailVerifyToken
}

export enum MediaType {
  Image,
  Video,
  HLS
}

export enum EncodingStatus {
  Pending, // Pending queue
  Processing, // encode
  Success, // 
  Failed, //
} 