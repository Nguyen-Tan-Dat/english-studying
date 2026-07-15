import { store } from '../../infrastructure/store/memory.store.js';
import { UnauthorizedError } from '../../shared/errors/app-error.js';
import { signAccessToken } from '../../shared/utils/jwt.js';
import { env } from '../../config/env.js';
export class AuthService {
  register(input: {email:string;password:string;display_name:string}) { return this.session(store.register(input)); }
  async login(input: {email:string;password:string}) { const user = await store.authenticate(input.email,input.password); if (!user) throw new UnauthorizedError('Email or password is incorrect'); return this.session(user); }
  refresh(refreshToken?: string) { if (!refreshToken) throw new UnauthorizedError('Refresh session is missing'); const rotated = store.rotateRefresh(refreshToken); if (!rotated) throw new UnauthorizedError('Refresh session is invalid or expired'); return { payload: this.sessionPayload(rotated.user), refreshToken: rotated.token }; }
  logout(refreshToken?: string) { store.revokeRefresh(refreshToken); }
  private session(user: ReturnType<typeof store.getUser>) { const refreshToken = store.createRefresh(user.id); return { payload: this.sessionPayload(user), refreshToken }; }
  private sessionPayload(user: ReturnType<typeof store.getUser>) { return { access_token: signAccessToken(user), token_type: 'Bearer' as const, expires_in: env.ACCESS_TOKEN_TTL_SECONDS, user: store.userResponse(user) }; }
}
export const authService = new AuthService();
