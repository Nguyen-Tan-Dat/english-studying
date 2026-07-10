import bcrypt from 'bcryptjs';
import jwt, { type JwtPayload } from 'jsonwebtoken';

import { env } from '../config/env';
import { db } from '../database/db';
import { ApiError } from '../utils/api-error';

interface LoginInput {
  identifier: string;
  password: string;
  ipAddress: string;
  userAgent: string;
}

interface AuthenticatedUser {
  id: string;
  email: string;
  userName: string;
}

export class AuthService {
  async login(input: LoginInput): Promise<{
    accessToken: string;
    expiresAt: string;
    user: AuthenticatedUser;
  }> {
    const user = await db
      .selectFrom('users')
      .select(['id', 'email', 'user_name', 'password', 'locked_until'])
      .where((expressionBuilder) =>
        expressionBuilder.or([
          expressionBuilder('email', '=', input.identifier),
          expressionBuilder('user_name', '=', input.identifier),
        ]),
      )
      .executeTakeFirst();

    if (!user) {
      throw ApiError.unauthorized('Invalid email, username, or password');
    }

    if (user.locked_until && user.locked_until.getTime() > Date.now()) {
      throw new ApiError(423, 'This account is temporarily locked');
    }

    const passwordMatches = await bcrypt.compare(input.password, user.password);

    if (!passwordMatches) {
      throw ApiError.unauthorized('Invalid email, username, or password');
    }

    const authenticatedUser: AuthenticatedUser = {
      id: user.id,
      email: user.email,
      userName: user.user_name,
    };

    const accessToken = jwt.sign(
      {
        email: authenticatedUser.email,
        userName: authenticatedUser.userName,
      },
      env.JWT_SECRET,
      {
        subject: authenticatedUser.id,
        issuer: env.JWT_ISSUER,
        audience: env.JWT_AUDIENCE,
        expiresIn: env.JWT_EXPIRES_IN_SECONDS,
      },
    );

    const expiresAt = new Date(
      Date.now() + env.JWT_EXPIRES_IN_SECONDS * 1_000,
    );

    await db.transaction().execute(async (transaction) => {
      await transaction
        .insertInto('tokens')
        .values({
          user_id: authenticatedUser.id,
          token: accessToken,
          token_type: 'access',
          ip_address: input.ipAddress,
          user_agent: input.userAgent,
          expires_at: expiresAt,
        })
        .execute();

      await transaction
        .updateTable('users')
        .set({ last_login_at: new Date() })
        .where('id', '=', authenticatedUser.id)
        .execute();
    });

    return {
      accessToken,
      expiresAt: expiresAt.toISOString(),
      user: authenticatedUser,
    };
  }

  async verifyAccessToken(token: string): Promise<AuthenticatedUser> {
    let payload: JwtPayload;

    try {
      const decodedToken = jwt.verify(token, env.JWT_SECRET, {
        issuer: env.JWT_ISSUER,
        audience: env.JWT_AUDIENCE,
      });

      if (typeof decodedToken === 'string') {
        throw new Error('Unexpected JWT payload');
      }

      payload = decodedToken;
    } catch {
      throw ApiError.unauthorized('Access token is invalid or expired');
    }

    if (
      typeof payload.sub !== 'string' ||
      typeof payload.email !== 'string' ||
      typeof payload.userName !== 'string'
    ) {
      throw ApiError.unauthorized('Access token payload is invalid');
    }

    const activeToken = await db
      .selectFrom('tokens')
      .innerJoin('users', 'users.id', 'tokens.user_id')
      .select([
        'users.id',
        'users.email',
        'users.user_name',
        'users.locked_until',
      ])
      .where('tokens.token', '=', token)
      .where('tokens.token_type', '=', 'access')
      .where('tokens.expires_at', '>', new Date())
      .where('users.id', '=', payload.sub)
      .executeTakeFirst();

    if (!activeToken) {
      throw ApiError.unauthorized('Access token has been revoked or expired');
    }

    if (
      activeToken.locked_until &&
      activeToken.locked_until.getTime() > Date.now()
    ) {
      throw new ApiError(423, 'This account is temporarily locked');
    }

    return {
      id: activeToken.id,
      email: activeToken.email,
      userName: activeToken.user_name,
    };
  }
}

export const authService = new AuthService();
