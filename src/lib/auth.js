const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const connectPgSimple = require('connect-pg-simple');
const pg = require('pg');

const env = require('../config/env');
const authService = require('../services/authService');

const PgSession = connectPgSimple(session);
const pool = new pg.Pool({
  connectionString: env.databaseUrl
});
const isHttpsApp = env.appUrl.startsWith('https://');

function createSessionMiddleware() {
  return session({
    store: new PgSession({
      pool,
      tableName: 'user_sessions',
      createTableIfMissing: true
    }),
    name: 'music.sid',
    secret: env.getRequiredEnv('SESSION_SECRET'),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: isHttpsApp,
      maxAge: 1000 * 60 * 60 * 24 * 14
    }
  });
}

function configurePassport() {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.getRequiredEnv('GOOGLE_CLIENT_ID'),
        clientSecret: env.getRequiredEnv('GOOGLE_CLIENT_SECRET'),
        callbackURL: `${env.appUrl}/auth/google/callback`
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await authService.upsertGoogleUser(profile);
          done(null, authService.toSessionUser(user));
        } catch (error) {
          done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await authService.getUserById(id);

      if (!user) {
        return done(null, false);
      }

      done(null, authService.toSessionUser(user));
    } catch (error) {
      done(error);
    }
  });
}

module.exports = {
  createSessionMiddleware,
  configurePassport,
  passport,
  pool
};
