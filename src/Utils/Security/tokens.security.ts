import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import { HUserDocument } from "../../DB/Models/user.model";
import { RoleEnum } from "../enums/user.enum";
import { env } from "../../Config/config.service";
import { InternalServerException } from "../response/error.response";

export const generateToken = ({
  payload,
  secret,
  options,
}: {
  payload: object;
  secret: Secret;
  options: SignOptions;
}): string => {
  return jwt.sign(payload, secret, options);
};

export interface ITokenPayload extends JwtPayload {
  id: string,
}

export const verifyToken = ({
  token,
  secret,
}: {
  token: string;
  secret: Secret;
}): ITokenPayload  => {
  return jwt.verify(token, secret) as ITokenPayload;
};

interface ILoginCredentials {
    accessToken: string | undefined;
    refreshToken: string | undefined;
}

export interface ISignature extends ILoginCredentials {
  accessExpiresIn?: number;
  refreshExpiresIn?: number;
}

export const getSignature = ({
  signatureLevel,
}: {
  signatureLevel: RoleEnum;
}) => {
  let signature: ISignature = {
    accessToken: undefined,
    refreshToken: undefined,
  };

  switch (signatureLevel) {
    case RoleEnum.ADMIN:
      signature.accessToken = env.ACCESS_TOKEN_ADMIN_SIGNATURE;
      signature.refreshToken = env.REFRESH_TOKEN_ADMIN_SIGNATURE;
      signature.accessExpiresIn = env.ACCESS_TOKEN_ADMIN_EXPIRES_IN;
      signature.refreshExpiresIn = env.REFRESH_TOKEN_ADMIN_EXPIRES_IN;
      break;
    case RoleEnum.USER:
      signature.accessToken = env.ACCESS_TOKEN_USER_SIGNATURE;
      signature.refreshToken = env.REFRESH_TOKEN_USER_SIGNATURE;
      signature.accessExpiresIn = env.ACCESS_TOKEN_USER_EXPIRES_IN;
      signature.refreshExpiresIn = env.REFRESH_TOKEN_USER_EXPIRES_IN;
      break;
    default:
        throw new InternalServerException("Invalid signature check env");
  }

  return signature;
};

export const getNewLoginCredentials = (user: HUserDocument): ILoginCredentials => {
  const signature = getSignature({ signatureLevel: user.role });
    if (!signature.accessToken || !signature.refreshToken || !signature.accessExpiresIn || !signature.refreshExpiresIn)
      throw new InternalServerException("Invalid signature check env");

  const accessToken = generateToken({
    payload: {
      id: user._id,
    },
    secret: signature.accessToken,
    options: { expiresIn: signature.accessExpiresIn },
  });

  const refreshToken = generateToken({
    payload: {
      id: user._id,
    },
    secret: signature.refreshToken,
    options: { expiresIn: signature.refreshExpiresIn },
  });

  return { accessToken, refreshToken };
};
