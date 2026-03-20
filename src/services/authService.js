const prisma = require('../lib/prisma');

async function upsertGoogleUser(profile) {
  const email = profile.emails?.[0]?.value;

  if (!email) {
    throw new Error('Google account email is required');
  }

  const avatarUrl = profile.photos?.[0]?.value || null;
  const displayName = profile.displayName || email.split('@')[0];

  const existingByGoogleId = await prisma.user.findUnique({
    where: { googleId: profile.id }
  });

  if (existingByGoogleId) {
    return prisma.user.update({
      where: { id: existingByGoogleId.id },
      data: {
        email,
        displayName,
        avatarUrl
      }
    });
  }

  const existingByEmail = await prisma.user.findUnique({
    where: { email }
  });

  if (existingByEmail) {
    return prisma.user.update({
      where: { id: existingByEmail.id },
      data: {
        googleId: profile.id,
        displayName,
        avatarUrl
      }
    });
  }

  return prisma.user.create({
    data: {
      email,
      googleId: profile.id,
      displayName,
      avatarUrl
    }
  });
}

function toSessionUser(user) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl
  };
}

async function getUserById(id) {
  return prisma.user.findUnique({ where: { id } });
}

module.exports = {
  upsertGoogleUser,
  toSessionUser,
  getUserById
};
