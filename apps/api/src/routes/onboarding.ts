import { Hono } from "hono";
import { auth } from "../lib/auth";
import { db } from "@packages/db";
import { user } from "@packages/db";
import { eq } from "drizzle-orm";

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
  const { slug } = body;
 
  if (!slug?.trim()) {
    return c.json({ error: "slug is required" }, 400);
  }
 
  const result = await auth.api.checkOrganizationSlug({
    body: { slug },
  });
 
  // Returns { status: true } if available, { status: false } if taken
  return c.json(result);
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
  const { name } = body;

  if (!name?.trim()) {
    return c.json({ error: "name is required" }, 400);
  }

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

// Step 2: Create organisation
onboardingRoutes.post("/organisation", async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json();
  const { orgName, orgSlug } = body;

  if (!orgName?.trim() || !orgSlug?.trim()) {
    return c.json({ error: "orgName and orgSlug are required" }, 400);
  }

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
  const slugCheck = await auth.api.checkOrganizationSlug({
    body: { slug: orgSlug },
  });

  if (slugCheck.status === false) {
    return c.json({ error: "This slug is already taken" }, 409);
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