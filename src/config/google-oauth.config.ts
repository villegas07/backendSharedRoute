export const googleOauthConfig = (): { googleOauth: Record<string, string> } => ({
  googleOauth: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL ?? 'http://localhost:3000/api/v1/auth/google/callback',
    successRedirect: process.env.GOOGLE_SUCCESS_REDIRECT_URL ?? 'http://localhost:5173/auth/success',
  },
});
