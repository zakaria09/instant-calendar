import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { availability, calendars } from '@packages/db';
import { db } from '@packages/db';
import { eq } from 'drizzle-orm';

type RouteVariables = {
  user: { id: string; name?: string | null } | string;
};

const calendarRoutes = new Hono<{ Variables: RouteVariables }>();

calendarRoutes.use('*', authMiddleware);

calendarRoutes.get('/availability', async (c) => {
const currentUser = c.get('user') as { id: string } | string;
const userId = typeof currentUser === 'string' ? currentUser : currentUser.id;

const availabilityData = await db
  .select({
    day: availability.day,
    startTime: availability.startTime,
    endTime: availability.endTime,
  })
  .from(availability)
  .innerJoin(calendars, eq(availability.calendarId, calendars.id))
  .where(eq(calendars.userId, userId));

  return c.json({ availability: availabilityData });
});

export default calendarRoutes;