import jwt, { SignOptions }  from 'jsonwebtoken'
import { config } from 'dotenv'

config()
interface Props {
  payload: string | Buffer | object,
  privateKey?: string
  option?: SignOptions,
};

export const signToken = ({ payload, privateKey= process.env.JWT_SECRET as string, option = { algorithm: 'HS256' } }: Props) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, option, (error, token) => {
      if (error) {
        throw reject(error)
      };
      return resolve(token as string)
    })
  })
}

export const verifyAccessToken = ({ token, secretOrPublicKey = process.env.JWT_SECRET as string }: {token: string, secretOrPublicKey?: string}) => {
  return new Promise<jwt.JwtPayload>((resolve, reject) => {
    jwt.verify(token, secretOrPublicKey, (error, decoded) => {
      if(error) {
        throw reject(error)
      };
      resolve(decoded as jwt.JwtPayload)
    })
  })
}