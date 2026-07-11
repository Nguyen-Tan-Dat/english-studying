export interface AuthUser {
  id: string;
  email: string;
  userName: string;
}

export interface AuthSession {
  accessToken: string;
  expiresAt: string;
  user: AuthUser;
}

export interface RegisterResult {
  user: AuthUser;
}

export interface ForgotPasswordResult {
  message: string;
  development?: {
    resetToken: string;
    resetUrl: string;
    expiresAt: string;
  };
}

export interface ResetPasswordResult {
  message: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string | null;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: Permission[];
}

export interface ApiErrorBody {
  success?: false;
  message?: string;
  details?: unknown;
}
