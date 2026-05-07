import {Hono} from 'hono';
import {authMiddleware} from '../middleware/auth';
import {db, services, member, organization} from '@packages/db';
import {eq} from 'drizzle-orm';
import {z} from 'zod';
import {auth} from '../lib/auth';

type RouteVariables = {
  user: {id: string; name?: string | null} | string;
};

const appendServiceSchema = z.object({
  service: z.string().trim().min(1, 'service is required'),
  organizationId: z.string(),
});

const servicesRoute = new Hono<{Variables: RouteVariables}>();

// servicesRoute.use('*', authMiddleware);

servicesRoute.post('/append', async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });
  const body = await c.req.json();
  const parsed = appendServiceSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      {error: parsed.error.issues[0]?.message ?? 'Invalid request body'},
      400,
    );
  }

  await db.insert(services).values({
    userId: session?.user.id as string,
    name: parsed.data.service,
    organizationId: parsed.data.organizationId,
  });

  return c.json({success: true});
});

servicesRoute.get('/list', async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  const userId = session?.user.id as string;

  const membership = await db
    .select({
      organizationId: member.organizationId,
      organizationName: organization.name,
    })
    .from(member)
    .innerJoin(organization, eq(organization.id, member.organizationId))
    .where(eq(member.userId, userId))
    .limit(1);

  if (!membership.length) {
    return c.json({services: [], organizations: membership});
  }

  const userServices = await db
    .select()
    .from(services)
    .where(eq(services.organizationId, membership[0].organizationId));

  return c.json({
    services: userServices,
    organizations: membership,
  });
});

export default servicesRoute;
