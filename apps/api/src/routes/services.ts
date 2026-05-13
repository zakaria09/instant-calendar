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
  services: z.array(z.object({
    name: z.string().trim().min(1, 'Service name is required'),
    duration: z.number().int().positive('Duration must be a positive number'),
    price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Price must be a valid amount'),
  })).min(1, 'At least one service is required'),
});

const servicesRoute = new Hono<{Variables: RouteVariables}>();

servicesRoute.use('*', authMiddleware);

servicesRoute.post('/append', async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({error: 'Unauthorized'}, 401);
  }

  const body = await c.req.json();
  const parsed = appendServiceSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      {error: parsed.error.issues[0]?.message ?? 'Invalid request body'},
      400,
    );
  }

  const [membership] = await db
    .select({ organizationId: member.organizationId })
    .from(member)
    .where(eq(member.userId, session.user.id))
    .limit(1);

  if (!membership) {
    return c.json({ error: 'No organisation found' }, 404);
  }

await db.insert(services).values(
  parsed.data.services.map((service) => ({
    userId: session.user.id,
    name: service.name,
    duration: service.duration,
    price: service.price,
    organizationId: membership.organizationId,
  }))
);

  return c.json({ success: true });
});

servicesRoute.get('/list', async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({error: 'Unauthorized'}, 401);
  }

  const membership = await db
    .select({
      organizationId: member.organizationId,
      organizationName: organization.name,
    })
    .from(member)
    .innerJoin(organization, eq(organization.id, member.organizationId))
    .where(eq(member.userId, session.user.id))
    .limit(1);

  if (!membership.length) {
    return c.json({ organization: null, services: [] });
  }

  const orgServices = await db
    .select({
      id: services.id,
      name: services.name,
      duration: services.duration,
      price: services.price,
    })
    .from(services)
    .where(eq(services.organizationId, membership[0].organizationId));

  return c.json({
    organization: membership[0],
    services: orgServices,
  });
});

export default servicesRoute;