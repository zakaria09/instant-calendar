import { Hono } from 'hono';
import servicesRoute from './services';
import { authMiddleware } from '../middleware/auth';
import { db, member, user, organization } from '@packages/db';
import { eq } from 'drizzle-orm'
import { auth } from '../lib/auth';

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

organisationRoute.get('/me', async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  })

  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

const [result] = await db
  .select({
    id: organization.id,
    name: organization.name,
    slug: organization.slug,
    logo: organization.logo,
    createdAt: organization.createdAt,
    role: member.role,
  })
  .from(member)
  .innerJoin(organization, eq(member.organizationId, organization.id))
  .where(eq(member.userId, session.user.id))

  if (!result) {
    return c.json({ error: 'No organisation found for this user' }, 404)
  }

  return c.json(result)
})

export default organisationRoute;