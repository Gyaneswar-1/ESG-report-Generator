import { hash } from 'bcryptjs';
import { db } from './client.js';

let schemaInitialized: Promise<void> | undefined;

export async function initDatabase(): Promise<void> {
  if (schemaInitialized) return schemaInitialized;

  schemaInitialized = (async () => {
    // 1. Seed Initial Entity Hierarchy if empty using Prisma ORM
    const existingEntities = await db.orm.public.EsgEntities.all();
    if (existingEntities.length === 0) {
      // Group
      const grp = await db.orm.public.EsgEntities.create({
        name: 'MEIL Corporate Group',
        level: 'group',
        region: 'National',
      });

      // Subsidiaries
      const sub1 = await db.orm.public.EsgEntities.create({
        name: 'MEIL Water & Natural Resources',
        level: 'subsidiary',
        parentId: grp.id,
        region: 'Odisha Region',
      });

      const sub2 = await db.orm.public.EsgEntities.create({
        name: 'MEIL Power & Renewables',
        level: 'subsidiary',
        parentId: grp.id,
        region: 'East & Central',
      });

      const sub3 = await db.orm.public.EsgEntities.create({
        name: 'MEIL Infrastructure & Roads',
        level: 'subsidiary',
        parentId: grp.id,
        region: 'South Region',
      });

      // Sites
      await db.orm.public.EsgEntities.create({
        name: 'Bhubaneswar Water Grid',
        level: 'site',
        parentId: sub1.id,
        region: 'Odisha Region',
      });

      await db.orm.public.EsgEntities.create({
        name: 'Cuttack Pipeline Grid',
        level: 'site',
        parentId: sub1.id,
        region: 'Odisha Region',
      });

      await db.orm.public.EsgEntities.create({
        name: 'Rourkela Substation',
        level: 'site',
        parentId: sub2.id,
        region: 'Odisha Region',
      });

      await db.orm.public.EsgEntities.create({
        name: 'Hyderabad Solar Hub',
        level: 'site',
        parentId: sub2.id,
        region: 'Telangana Region',
      });

      await db.orm.public.EsgEntities.create({
        name: 'Vijayawada Expressway Project',
        level: 'site',
        parentId: sub3.id,
        region: 'Andhra Pradesh',
      });
    }

    // 2. Bootstrap Executive Super Admin (CSO) using Prisma ORM
    const bootstrapEmail = (process.env.BOOTSTRAP_ADMIN_EMAIL || 's.r.sahoo370@gmail.com').trim().toLowerCase();
    const bootstrapPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD || 'YourStrongPassword123!';
    const passwordHash = await hash(bootstrapPassword, 12);

    const existingUser = await db.orm.public.EsgUsers.where((u) => u.email.eq(bootstrapEmail)).first();
    if (existingUser) {
      await db.orm.public.EsgUsers.where((u) => u.id.eq(existingUser.id)).update({
        passwordHash,
        role: 'executive',
        isProfileCompleted: true,
        isApproved: true,
        approvalStatus: 'approved',
      });
    } else {
      await db.orm.public.EsgUsers.create({
        email: bootstrapEmail,
        name: 'CSO / Super Admin',
        passwordHash,
        role: 'executive',
        isProfileCompleted: true,
        isApproved: true,
        approvalStatus: 'approved',
        department: 'Executive Committee',
        designation: 'Chief Sustainability Officer',
        organization: 'MEIL Corporate',
        location: 'Bhubaneswar HQ',
      });
    }
  })();

  return schemaInitialized;
}
