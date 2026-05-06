import { Hono } from 'hono';
import { auth } from '../lib/auth';
import { availability, calendars } from '@packages/db';
import { db } from '@packages/db';
import { eq } from 'drizzle-orm';

const calendarRoutes = new Hono();

calendarRoutes.get('/availability', async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401);
  };

const availabilityData = await db
  .select({
    day: availability.day,
    startTime: availability.startTime,
    endTime: availability.endTime,
  })
  .from(availability)
  .innerJoin(calendars, eq(availability.calendarId, calendars.id))
  .where(eq(calendars.userId, session.user.id));

  return c.json({ availability: availabilityData });
});

export default calendarRoutes;