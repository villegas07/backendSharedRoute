export interface PasswordResetEmailData {
  to: string;
  token: string;
  userName: string;
}

export abstract class EmailPort {
  abstract sendPasswordResetEmail(data: PasswordResetEmailData): Promise<void>;
}
