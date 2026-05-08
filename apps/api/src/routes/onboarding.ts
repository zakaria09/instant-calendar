import { Hono } from "hono";
import { auth } from "../lib/auth";
import { availability, db } from "@packages/db";
import { user } from "@packages/db";
import { eq } from "drizzle-orm";
import { calendars } from '@packages/db';
import {z} from 'zod'

const availabilityEntrySchema = z.array(z.object({
  day: z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "startTime must be in HH:mm format"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "endTime must be in HH:mm format"),
}))

const checkSlugSchema = z.object({
  slug: z.string().trim().min(1, 'slug is required'),
})

const profileSchema = z.object({
  name: z.string().trim().min(1, 'name is required'),
})

const organisationSchema = z.object({
  orgName: z.string().trim().min(1, 'orgName is required'),
  orgSlug: z.string().trim().min(1, 'orgSlug is required'),
})

const onboardingRoutes = new Hono();

// Check onboarding status
onboardingRoutes.get("/status", async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const [currentUser] = await db
    .select({ isOnboarded: user.isOnboarded })
    .from(user)
    .where(eq(user.id, session.user.id));

  return c.json({ isOnboarded: currentUser?.isOnboarded ?? false });
});

// Check slug availability (used by the frontend during typing)
onboardingRoutes.post("/check-slug", async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json();
  const parsed = checkSlugSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? "Invalid request body" }, 400);
  }

  try {
    const result = await auth.api.checkOrganizationSlug({
      body: { slug: parsed.data.slug },
    });
    return c.json(result);
  } catch (error) {
    if (
      error instanceof Error &&
      "status" in error &&
      error.status === "BAD_REQUEST"
    ) {
      return c.json({ status: false });
    }
    throw error;
  }
});

// Step 1: Update profile
onboardingRoutes.post("/profile", async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json();
  const parsed = profileSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? 'Invalid request body' }, 400);
  }

  const { name } = parsed.data;

  if (session.user.name !== name) {
    await db
      .update(user)
      .set({ name, updatedAt: new Date() })
      .where(eq(user.id, session.user.id));
  }

  return c.json({
    user: { id: session.user.id, name },
  });
});

// Step 2: Add availability 
onboardingRoutes.post("/availability", async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json();
  const { availability: slots } = body;

  const availabilityParsed = availabilityEntrySchema.safeParse(slots);

  if (!availabilityParsed.success) {
    return c.json({ error: "Invalid availability format", details: availabilityParsed.error.cause }, 400);
  }

  const result = await db.transaction(async (tx) => {

    // check if user already has a calendar (idempotency)
    const existingCalendars = await tx.select().from(calendars).where(eq(calendars.userId, session.user.id))

    if (existingCalendars.length > 0) {
      return { alreadyExists: true };
    }

    // Add user's initial calendar
    const [calendar] = await tx.insert(calendars).values({
      userId: session.user.id,
      name: `${session.user.name}'s Calendar`,
    }).returning({ id: calendars.id })

    // Add availability entries linked to the calendar
    const availabilityEntries = availabilityParsed.data.map((entry) => ({
      calendarId: calendar.id,
      day: entry.day,
      startTime: entry.startTime,
      endTime: entry.endTime,
    }));

    const result = await tx.insert(availability).values(availabilityEntries);

    return { alreadyExists: false, calendarId: calendar.id };

  })

  if (result.alreadyExists) {
    return c.json({ success: true, message: "Availability already set" });
  }

  return c.json({ success: true, calendarId: result.calendarId });

});

// Step 3: Create organisation
onboardingRoutes.post("/organisation", async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json();
  const parsed = organisationSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? 'Invalid request body' }, 400);
  }

  const { orgName, orgSlug } = parsed.data;

  // Idempotency: check if user already has an org
  const existingOrgs = await auth.api.listOrganizations({
    headers: c.req.raw.headers,
  });

  if (existingOrgs && existingOrgs.length > 0) {
    const org = existingOrgs[0];

    await auth.api.setActiveOrganization({
      body: { organizationId: org.id },
      headers: c.req.raw.headers,
    });

    return c.json({ organization: org, alreadyOnboarded: true });
  }

  // Check slug availability
  try {
    await auth.api.checkOrganizationSlug({
      body: { slug: orgSlug },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      "status" in error &&
      error.status === "BAD_REQUEST"
    ) {
      return c.json({ error: "This slug is already taken" }, 409);
    }
    throw error;
  }

  // Create and set active
  const org = await auth.api.createOrganization({
    body: { name: orgName, slug: orgSlug },
    headers: c.req.raw.headers,
  });

  await auth.api.setActiveOrganization({
    body: { organizationId: org.id },
    headers: c.req.raw.headers,
  });

  // Mark onboarding complete
  await db
    .update(user)
    .set({ isOnboarded: true, updatedAt: new Date() })
    .where(eq(user.id, session.user.id));

  return c.json({ organization: org, alreadyOnboarded: false });
});

export default onboardingRoutes;