import { auth } from "@/auth";
import { db } from "@/db/db";
import { usersTable, UserType } from "@/db/schema/usersTable";
import { eq } from "drizzle-orm";
import { JwtPayload, sign, verify } from "jsonwebtoken";
import { headers } from "next/headers";
import UserResource, { UserResourceType } from "../../resource/userResource";
import UserService from "../userService";

class AuthService {
  static async getAuthUser(): Promise<UserResourceType | null> {
    const headersList = await headers();
    const userHeader = headersList.get("X-User") as string;
    if (userHeader) {
      const jwtUser = JSON.parse(userHeader) as UserType;
      const user = await db.query.usersTable.findFirst({ where: eq(usersTable.customer_id, jwtUser.customer_id) });
      if (user) return new UserResource(user).toJSON();
    }

    const session = await auth();

    if (!session || !session.user) {
      return null;
    }
    const user = await UserService.findUserByCustomerId(session?.user.customer_id);
    if (!user) return null;
    if (session) {
      return user;
    }
    return null;
  }
  // static async verifyUserPasswordHash(email: string, password: string): Promise<UserResourceType | false> {
  //   const user = await UserService.findByEmail(email);

  //   if (!user || !user?.password) {
  //     return false;
  //   }

  //   const isValid = await bcrypt.compare(password, user.password);

  //   if (isValid) {
  //     return new UserResource(user).toJSON();
  //   } else {
  //     return false;
  //   }
  // }

  static async issueAccessToken(user: UserResourceType): Promise<string> {
    return new Promise((resolve, reject) => {
      sign(
        { ...user, tokenType: "access" },
        process.env.AUTH_SECRET!,
        {
          algorithm: "HS256",
          expiresIn: "2h",
        },
        function (err, token) {
          if (err) {
            reject(err);
          } else {
            if (token) {
              resolve(token);
            } else {
              reject(err);
            }
          }
        },
      );
    });
  }

  static async issueRefreshToken(user: UserType) {
    return new Promise((resolve, reject) => {
      sign(
        { ...user, tokenType: "refresh" },
        process.env.REFRESH_SECRET!,
        {
          algorithm: "HS256",
          expiresIn: "30d",
        },
        function (err, token) {
          if (err) {
            reject(err);
          } else {
            resolve(token);
          }
        },
      );
    });
  }

  static async validateBearerToken(bearerToken: string): Promise<string | JwtPayload | false> {
    const token = bearerToken.split(" ")[1];
    if (!token) {
      return false;
    }

    try {
      return await this.decodeToken(token);
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  static async decodeToken(token: string): Promise<string | JwtPayload | false> {
    return new Promise((resolve) => {
      verify(token, process.env.AUTH_SECRET!, function (err, decoded) {
        if (err) {
          return resolve(false);
        } else {
          if (!decoded) {
            return resolve(false);
          }
          return resolve(decoded);
        }
      });
    });
  }
}

export default AuthService;
