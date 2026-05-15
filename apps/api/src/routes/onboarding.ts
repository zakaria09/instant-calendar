import { Hono } from "hono";
import { auth } from "../lib/auth";
import { availability, db, invitation, organization } from "@packages/db";
import { user } from "@packages/db";
import { eq } from "drizzle-orm";
import { calendars } from '@packages/db';
import {z} from 'zod'
import { and } from "drizzle-orm";

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

  const existingOrgs = await auth.api.listOrganizations({
    headers: c.req.raw.headers,
  });

  if (existingOrgs && existingOrgs.length > 0) {
    const org = existingOrgs[0];

    await auth.api.setActiveOrganization({
      body: { organizationId: org.id },
      headers: c.req.raw.headers,
    });

    return c.json({ organization: org });
  }

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

  const org = await auth.api.createOrganization({
    body: { name: orgName, slug: orgSlug },
    headers: c.req.raw.headers,
  });

  await auth.api.setActiveOrganization({
    body: { organizationId: org.id },
    headers: c.req.raw.headers,
  });

  return c.json({ organization: org });
});

// Check if user has a pending invitation
onboardingRoutes.get("/invite-status", async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const [pendingInvite] = await db
    .select({
      invitationId: invitation.id,
      organizationId: invitation.organizationId,
      organizationName: organization.name,
      role: invitation.role,
    })
    .from(invitation)
    .innerJoin(organization, eq(invitation.organizationId, organization.id))
    .where(
      and(
        eq(invitation.email, session.user.email),
        eq(invitation.status, "pending")
      )
    )
    .limit(1);

  return c.json({
    hasInvite: !!pendingInvite,
    invite: pendingInvite ?? null,
  });
});

// TODO
// We need to check if the user has a pending invitation before onboarding, if they do, we redirect them to the invitation page instead of onboarding
// Once they accept or decline the invitation, we check if they are onboarded, if not, we redirect them to onboard onto an organisation
onboardingRoutes.get("/check-invitations/:organizationId", async (c) => {
  const { organizationId } = c.req.param();
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const invitationsResult = await auth.api.listInvitations({
    query: {
      organizationId,
    },
    headers: c.req.raw.headers,
  });

  const pendingInvite =
    invitationsResult.find(
      (inv: { email?: string; status?: string }) =>
        inv.email === session.user.email && inv.status === "pending"
    ) ?? null;

  return c.json({
    hasInvite: !!pendingInvite,
    invite: pendingInvite,
  });
});

// Final step: complete onboarding
onboardingRoutes.post('/complete', async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  await db
    .update(user)
    .set({ isOnboarded: true, updatedAt: new Date() })
    .where(eq(user.id, session.user.id));

  return c.json({ success: true, isOnboarded: true });
});

export default onboardingRoutes;