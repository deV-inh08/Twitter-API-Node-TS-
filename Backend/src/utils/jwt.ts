import jwt, { SignOptions }  from 'jsonwebtoken'
import { config } from 'dotenv'
import { TokenPayload } from '~/models/requests/user.request'

config()
interface Props {
  payload: string | Buffer | object,
  privateKey: string
  option?: SignOptions,
};

export const signToken = ({ payload, privateKey, option = { algorithm: 'HS256' } }: Props) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, option, (error, token) => {
      if (error) {
        throw reject(error)
      };
      return resolve(token as string)
    })
  })
};

export const verifyToken = ({ token, secretOrPublicKey }: {token: string, secretOrPublicKey: string}) => {
  return new Promise<TokenPayload>((resolve, reject) => {
    jwt.verify(token, secretOrPublicKey, (error, decoded) => {
      if(error) {
        throw reject(error)
      };
      resolve(decoded as TokenPayload)
    })
  })
};