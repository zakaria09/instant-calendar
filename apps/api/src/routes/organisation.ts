import { Hono } from 'hono';
import servicesRoute from './services';
import { authMiddleware } from '../middleware/auth';
import { db, member, user } from '@packages/db';
import { eq } from 'drizzle-orm'

const organisationRoute = new Hono();

servicesRoute.use('*', authMiddleware);

organisationRoute.get('/members/:organisationId', async (c) => {
  const { organisationId } = c.req.param()
  const members = await db
    .select({
      memberId: member.id,
      role: member.role,
      createdAt: member.createdAt,
      name: user.name,
      email: user.email,
    })
    .from(member)
    .innerJoin(user, eq(member.userId, user.id))
    .where(eq(member.organizationId, organisationId));

  return c.json(members);
});

export default organisationRoute;