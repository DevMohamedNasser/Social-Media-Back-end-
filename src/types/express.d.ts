// Global Express Types
// Make req.user & req.decoded available everywhere after authentication

import { HUserDocument } from "../DB/Models/user.model";
import { ITokenPayload } from "../Utils/Security/tokens.security";

declare global {
  namespace Express {
    interface Request {
      user?: HUserDocument;
      decoded?: ITokenPayload;
    }
  }
}

export {};
