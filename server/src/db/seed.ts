import 'dotenv/config';
import { hash } from 'bcryptjs';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { initDatabase } from './schema.js';
import { db } from './client.js';
import { generateEvidencePdf } from '../utils/pdfGenerator.js';

export async function seedDatabase() {
  await initDatabase();
  console.log('Seeding rich demonstration data using Prisma ORM...');

  // 1. Fetch Entities
  const entities = await db.orm.public.EsgEntities.all();
  const entityMap = new Map<string, bigint>();
  for (const row of entities) {
    entityMap.set(row.name, row.id);
  }

  const waterSubId = entityMap.get('MEIL Water & Natural Resources');
  const powerSubId = entityMap.get('MEIL Power & Renewables');
  const infraSubId = entityMap.get('MEIL Infrastructure & Roads');

  const bhubaneswarSiteId = entityMap.get('Bhubaneswar Water Grid');
  const cuttackSiteId = entityMap.get('Cuttack Pipeline Grid');
  const rourkelaSiteId = entityMap.get('Rourkela Substation');
  const hyderabadSiteId = entityMap.get('Hyderabad Solar Hub');
  const vijayawadaSiteId = entityMap.get('Vijayawada Expressway Project');

  const defaultPasswordHash = await hash('Password12345!', 10);

  // Helper to upsert a user with Prisma ORM
  async function upsertUser(data: {
    email: string;
    name: string;
    passwordHash: string;
    role: string;
    isProfileCompleted: boolean;
    isApproved: boolean;
    approvalStatus: string;
    phone?: string;
    employeeId?: string;
    department?: string;
    designation?: string;
    qualifications?: string;
    organization?: string;
    location?: string;
    reviewNote?: string;
  }) {
    const existing = await db.orm.public.EsgUsers.where((u) => u.email.eq(data.email)).first();
    if (existing) {
      const updated = await db.orm.public.EsgUsers.where((u) => u.id.eq(existing.id)).update({
        name: data.name,
        passwordHash: data.passwordHash,
        role: data.role,
        isProfileCompleted: data.isProfileCompleted,
        isApproved: data.isApproved,
        approvalStatus: data.approvalStatus,
        phone: data.phone || '',
        employeeId: data.employeeId || '',
        department: data.department || '',
        designation: data.designation || '',
        qualifications: data.qualifications || '',
        organization: data.organization || '',
        location: data.location || '',
        reviewNote: data.reviewNote || '',
      });
      return updated ?? existing;
    }
    return db.orm.public.EsgUsers.create({
      email: data.email,
      name: data.name,
      passwordHash: data.passwordHash,
      role: data.role,
      isProfileCompleted: data.isProfileCompleted,
      isApproved: data.isApproved,
      approvalStatus: data.approvalStatus,
      phone: data.phone || '',
      employeeId: data.employeeId || '',
      department: data.department || '',
      designation: data.designation || '',
      qualifications: data.qualifications || '',
      organization: data.organization || '',
      location: data.location || '',
      reviewNote: data.reviewNote || '',
    });
  }

  async function addScope(userId: bigint, entityId?: bigint) {
    if (!entityId) return;
    try {
      await db.orm.public.EsgUserScopes.create({ userId, entityId });
    } catch {
      // Ignore duplicate
    }
  }

  // 2. Seed Users across Approval States
  // A) Subsidiary Heads
  const ashok = await upsertUser({
    email: 'ashok.patnaik@meilwater.com',
    name: 'Ashok Patnaik',
    passwordHash: defaultPasswordHash,
    role: 'subsidiary_head',
    isProfileCompleted: true,
    isApproved: true,
    approvalStatus: 'approved',
    phone: '+91 94370 12345',
    employeeId: 'MEIL-SH-101',
    department: 'Water Resources Directorate',
    designation: 'General Manager - Regional Projects',
    qualifications: 'M.Tech Environmental Engineering, ISO 14001 Lead Auditor',
    organization: 'MEIL Water & Natural Resources',
    location: 'Bhubaneswar HQ',
  });
  await addScope(ashok.id, waterSubId);

  const rajesh = await upsertUser({
    email: 'rajesh.verma@meilpower.com',
    name: 'Rajesh Verma',
    passwordHash: defaultPasswordHash,
    role: 'subsidiary_head',
    isProfileCompleted: true,
    isApproved: false,
    approvalStatus: 'pending',
    phone: '+91 98260 55443',
    employeeId: 'MEIL-SH-102',
    department: 'Renewable Energy Systems',
    designation: 'Vice President - Thermal & Solar Operations',
    qualifications: 'B.Tech Electrical, PMP, Certified Energy Manager',
    organization: 'MEIL Power & Renewables',
    location: 'Kolkata Regional Office',
  });
  await addScope(rajesh.id, powerSubId);

  const sunil = await upsertUser({
    email: 'sunil.kumar@meilinfra.com',
    name: 'Sunil Kumar',
    passwordHash: defaultPasswordHash,
    role: 'subsidiary_head',
    isProfileCompleted: true,
    isApproved: false,
    approvalStatus: 'rejected',
    phone: '+91 91000 88776',
    employeeId: 'MEIL-SH-103',
    department: 'Civil Infrastructure Division',
    designation: 'Project Director - Expressways',
    qualifications: 'B.E. Civil, MBA Construction Management',
    organization: 'MEIL Infrastructure & Roads',
    location: 'Vijayawada Camp Office',
    reviewNote: 'Statutory GST registration does not match subsidiary division records. Please re-submit verification documentation.',
  });
  await addScope(sunil.id, infraSubId);

  await upsertUser({
    email: 'vikram.rawat@meilpower.com',
    name: 'Vikram Rawat',
    passwordHash: defaultPasswordHash,
    role: 'subsidiary_head',
    isProfileCompleted: false,
    isApproved: false,
    approvalStatus: 'pending',
  });

  // B) Site Engineers
  const priyanka = await upsertUser({
    email: 'priyanka.mohanty@meilwater.com',
    name: 'Priyanka Mohanty',
    passwordHash: defaultPasswordHash,
    role: 'engineer',
    isProfileCompleted: true,
    isApproved: true,
    approvalStatus: 'approved',
    phone: '+91 98610 99887',
    employeeId: 'MEIL-ENG-501',
    department: 'Site Execution & Utilities',
    designation: 'Senior Utility Engineer',
    qualifications: 'B.Tech Civil Engineering, Certified Energy Manager',
    organization: 'MEIL Water & Natural Resources',
    location: 'Bhubaneswar Water Grid',
    reviewNote: 'Verified site posting at Bhubaneswar Water Grid with operations head signoff.',
  });
  await addScope(priyanka.id, bhubaneswarSiteId);
  await addScope(priyanka.id, waterSubId);

  const amit = await upsertUser({
    email: 'amit.das@meilpower.com',
    name: 'Amit Das',
    passwordHash: defaultPasswordHash,
    role: 'engineer',
    isProfileCompleted: true,
    isApproved: true,
    approvalStatus: 'approved',
    phone: '+91 97760 11223',
    employeeId: 'MEIL-ENG-502',
    department: 'Substation Electrical Engineering',
    designation: 'Plant Shift Incharge',
    qualifications: 'Diploma Electrical, BEE Certified Energy Auditor',
    organization: 'MEIL Power & Renewables',
    location: 'Rourkela Substation',
    reviewNote: 'Approved for Rourkela 400kV substation grid reporting.',
  });
  await addScope(amit.id, rourkelaSiteId);
  await addScope(amit.id, powerSubId);

  const rahul = await upsertUser({
    email: 'rahul.nayak@meilwater.com',
    name: 'Rahul Nayak',
    passwordHash: defaultPasswordHash,
    role: 'engineer',
    isProfileCompleted: true,
    isApproved: false,
    approvalStatus: 'pending',
    phone: '+91 93380 44556',
    employeeId: 'MEIL-ENG-503',
    department: 'Pipelines & Hydraulics',
    designation: 'Field Engineer',
    qualifications: 'B.Tech Mechanical Engineering',
    organization: 'MEIL Water & Natural Resources',
    location: 'Cuttack Pipeline Grid',
  });
  await addScope(rahul.id, cuttackSiteId);
  await addScope(rahul.id, waterSubId);

  const deepak = await upsertUser({
    email: 'deepak.swain@meilinfra.com',
    name: 'Deepak Swain',
    passwordHash: defaultPasswordHash,
    role: 'engineer',
    isProfileCompleted: true,
    isApproved: false,
    approvalStatus: 'rejected',
    phone: '+91 94390 77889',
    employeeId: 'MEIL-ENG-504',
    department: 'Earthworks & Pavement',
    designation: 'Quality Control Engineer',
    qualifications: 'B.Tech Civil',
    organization: 'MEIL Infrastructure & Roads',
    location: 'Vijayawada Expressway Project',
    reviewNote: 'Employee ID could not be validated with Vijayawada site HR roster. Contact site superintendent.',
  });
  await addScope(deepak.id, vijayawadaSiteId);
  await addScope(deepak.id, infraSubId);

  const manas = await upsertUser({
    email: 'manas.jena@meilpower.com',
    name: 'Manas Jena',
    passwordHash: defaultPasswordHash,
    role: 'engineer',
    isProfileCompleted: false,
    isApproved: false,
    approvalStatus: 'pending',
    organization: 'MEIL Power & Renewables',
  });
  await addScope(manas.id, powerSubId);

  // C) Auditor
  await upsertUser({
    email: 'auditor.kpmg@esg-assurance.com',
    name: 'Dr. Arindam Sen',
    passwordHash: defaultPasswordHash,
    role: 'auditor',
    isProfileCompleted: true,
    isApproved: true,
    approvalStatus: 'approved',
    phone: '+91 98100 22334',
    employeeId: 'AUD-KPMG-909',
    department: 'Climate & Sustainability Assurance',
    designation: 'Partner - ESG Assurance',
    qualifications: 'Ph.D Sustainability, Fellow Chartered Accountant (FCA), Lead GHG Verifier ISO 14064',
    organization: 'Independent Assurance Services LLP',
    location: 'Mumbai Corporate Office',
  });

  // 3. Seed Forms
  const existingForm = await db.orm.public.EsgForms.where((f) => f.title.eq('DG Set Heavy Fuel Log - Bhubaneswar Water Grid')).first();
  if (!existingForm) {
    await db.orm.public.EsgForms.create({
      title: 'DG Set Heavy Fuel Log - Bhubaneswar Water Grid',
      description: 'Record monthly diesel usage for generators and upload oil invoice proof',
      pillar: 'environmental',
      metricCode: 'diesel',
      defaultUnit: 'Liters',
      allowedUnits: ['Liters', 'Gallons', 'kL'],
      requiresFileUpload: true,
      fileInstruction: 'Upload fuel delivery voucher or invoice (PDF/Image)',
      siteId: bhubaneswarSiteId || null,
      siteName: 'Bhubaneswar Water Grid',
      subsidiaryId: waterSubId || null,
      isActive: true,
      createdBy: ashok.id,
    });
  }

  // 4. Evidence Vault
  const evidenceDir = resolve(process.env.ESG_UPLOAD_DIR ?? join(process.cwd(), 'uploads', 'evidence'));
  await mkdir(evidenceDir, { recursive: true });

  async function createSeedEvidence(params: {
    fileName: string;
    site: string;
    metric: string;
    metricCode: string;
    value: string;
    unit: string;
    period: string;
    reviewStatus?: string;
  }) {
    const { buffer, sha256 } = generateEvidencePdf({
      fileName: params.fileName,
      site: params.site,
      metric: params.metric,
      metricCode: params.metricCode,
      value: params.value,
      unit: params.unit,
      period: params.period,
      reviewStatus: params.reviewStatus || 'approved',
    });
    const storagePath = join(evidenceDir, `${sha256}.pdf`);
    await writeFile(storagePath, buffer, { flag: 'w' });

    let ev = await db.orm.public.EsgEvidence.where((e) => e.sha256.eq(sha256)).first();
    if (!ev) {
      ev = await db.orm.public.EsgEvidence.create({
        sha256,
        fileName: params.fileName,
        storagePath,
        mimeType: 'application/pdf',
        byteSize: BigInt(buffer.length),
      });
    }
    return { id: ev.id, sha256 };
  }

  const ev1 = await createSeedEvidence({
    fileName: 'diesel_tax_invoice_may2026.pdf',
    site: 'Bhubaneswar Water Grid',
    metric: 'Diesel consumed',
    metricCode: 'diesel',
    value: '13.4',
    unit: 'MT CO2e',
    period: '2026-05',
  });
  const ev2 = await createSeedEvidence({
    fileName: 'grid_utility_meter_may2026.pdf',
    site: 'Rourkela Substation',
    metric: 'Electricity consumed',
    metricCode: 'electricity',
    value: '45000',
    unit: 'kWh',
    period: '2026-05',
  });
  const ev3 = await createSeedEvidence({
    fileName: 'water_intake_meter_apr2026.pdf',
    site: 'Bhubaneswar Water Grid',
    metric: 'Water intake and withdrawal',
    metricCode: 'water',
    value: '12',
    unit: 'kL',
    period: '2026-04',
  });
  const ev4 = await createSeedEvidence({
    fileName: 'waste_manifest_apr2026.pdf',
    site: 'Rourkela Substation',
    metric: 'Hazardous & Non-hazardous waste recycled',
    metricCode: 'waste',
    value: '2.5',
    unit: 'MT',
    period: '2026-04',
  });
  const ev5 = await createSeedEvidence({
    fileName: 'disputed_fuel_slip_mar2026.pdf',
    site: 'Cuttack Pipeline Grid',
    metric: 'Diesel consumed (Calibration dispute)',
    metricCode: 'diesel',
    value: '25.46',
    unit: 'MT CO2e',
    period: '2026-03',
    reviewStatus: 'rejected',
  });

  // 5. Seed ESG Records
  if (bhubaneswarSiteId) {
    const rec1Existing = await db.orm.public.EsgRecords
      .where((r) => r.siteId.eq(bhubaneswarSiteId))
      .where((r) => r.period.eq('2026-05'))
      .where((r) => r.metricCode.eq('diesel'))
      .first();

    let rec1Id = rec1Existing?.id;
    if (!rec1Existing) {
      const rec1 = await db.orm.public.EsgRecords.create({
        site: 'Bhubaneswar Water Grid',
        period: '2026-05',
        pillar: 'environmental',
        metric: 'Diesel consumed',
        metricCode: 'diesel',
        value: '13.4',
        unit: 'MT CO2e',
        rawValue: '5000',
        rawUnit: 'Liters',
        formula: 'MT CO2e = (liters × 2.68) ÷ 1000',
        enteredBy: 'Priyanka Mohanty',
        role: 'engineer',
        evidence: 'diesel_tax_invoice_may2026.pdf',
        evidenceId: ev1.id,
        notes: 'Standby pump generator runs during peak grid outage',
        siteId: bhubaneswarSiteId,
        reviewStatus: 'approved',
        reviewedBy: 'Ashok Patnaik',
        reviewNote: 'Verified against IOCL delivery tanker slip',
      });
      rec1Id = rec1.id;
    }

    if (rec1Id) {
      const existingAudit = await db.orm.public.EsgRecordAudit.where((a) => a.recordId.eq(rec1Id!)).first();
      if (!existingAudit) {
        await db.orm.public.EsgRecordAudit.create({
          recordId: rec1Id,
          action: 'saved',
          rawValue: '5000',
          rawUnit: 'Liters',
          normalizedValue: '13.4',
          normalizedUnit: 'MT CO2e',
          formula: 'MT CO2e = (liters × 2.68) ÷ 1000',
          enteredBy: 'Priyanka Mohanty',
          role: 'engineer',
          evidenceId: ev1.id,
        });
        await db.orm.public.EsgRecordAudit.create({
          recordId: rec1Id,
          action: 'approved',
          rawValue: '5000',
          rawUnit: 'Liters',
          normalizedValue: '13.4',
          normalizedUnit: 'MT CO2e',
          formula: 'MT CO2e = (liters × 2.68) ÷ 1000',
          enteredBy: 'Ashok Patnaik',
          role: 'subsidiary_head',
          evidenceId: ev1.id,
        });
      }
    }
  }

  if (rourkelaSiteId) {
    const rec2Existing = await db.orm.public.EsgRecords
      .where((r) => r.siteId.eq(rourkelaSiteId))
      .where((r) => r.period.eq('2026-05'))
      .where((r) => r.metricCode.eq('electricity'))
      .first();

    if (!rec2Existing) {
      const rec2 = await db.orm.public.EsgRecords.create({
        site: 'Rourkela Substation',
        period: '2026-05',
        pillar: 'environmental',
        metric: 'Electricity consumed',
        metricCode: 'electricity',
        value: '45000',
        unit: 'kWh',
        rawValue: '45',
        rawUnit: 'MWh',
        formula: 'kWh = MWh × 1,000',
        enteredBy: 'Amit Das',
        role: 'engineer',
        evidence: 'grid_utility_meter_may2026.pdf',
        evidenceId: ev2.id,
        notes: 'Primary substation auxiliary transformer consumption',
        siteId: rourkelaSiteId,
        reviewStatus: 'approved',
        reviewedBy: 'Ashok Patnaik',
        reviewNote: 'OPTCL smart meter export validated',
      });

      await db.orm.public.EsgRecordAudit.create({
        recordId: rec2.id,
        action: 'approved',
        rawValue: '45',
        rawUnit: 'MWh',
        normalizedValue: '45000',
        normalizedUnit: 'kWh',
        formula: 'kWh = MWh × 1,000',
        enteredBy: 'Ashok Patnaik',
        role: 'subsidiary_head',
        evidenceId: ev2.id,
      });
    }
  }

  // 6. Additional Approved ESG Records for Complete BRSR Reporting
  if (bhubaneswarSiteId) {
    const waterExisting = await db.orm.public.EsgRecords
      .where((r) => r.siteId.eq(bhubaneswarSiteId))
      .where((r) => r.period.eq('2026-05'))
      .where((r) => r.metricCode.eq('water'))
      .first();

    if (!waterExisting) {
      await db.orm.public.EsgRecords.create({
        site: 'Bhubaneswar Water Grid',
        period: '2026-05',
        pillar: 'environmental',
        metric: 'Water intake and withdrawal',
        metricCode: 'water',
        value: '12',
        unit: 'kL',
        rawValue: '12000',
        rawUnit: 'Liters',
        formula: 'kL = Liters ÷ 1000',
        enteredBy: 'Priyanka Mohanty',
        role: 'engineer',
        evidence: 'water_intake_meter_apr2026.pdf',
        evidenceId: ev3.id,
        notes: 'Pumping station intake meter volume',
        siteId: bhubaneswarSiteId,
        reviewStatus: 'approved',
        reviewedBy: 'Ashok Patnaik',
        reviewNote: 'Calibrated electromagnetic flowmeter logs verified',
      });
    }
  }

  if (rourkelaSiteId) {
    const wasteExisting = await db.orm.public.EsgRecords
      .where((r) => r.siteId.eq(rourkelaSiteId))
      .where((r) => r.period.eq('2026-05'))
      .where((r) => r.metricCode.eq('waste'))
      .first();

    if (!wasteExisting) {
      await db.orm.public.EsgRecords.create({
        site: 'Rourkela Substation',
        period: '2026-05',
        pillar: 'environmental',
        metric: 'Hazardous & Non-hazardous waste recycled',
        metricCode: 'waste',
        value: '2.5',
        unit: 'MT',
        rawValue: '2500',
        rawUnit: 'kg',
        formula: 'MT = kg ÷ 1000',
        enteredBy: 'Amit Das',
        role: 'engineer',
        evidence: 'waste_manifest_apr2026.pdf',
        evidenceId: ev4.id,
        notes: 'Transformer oil reclamation and metallic scrap diversion manifest',
        siteId: rourkelaSiteId,
        reviewStatus: 'approved',
        reviewedBy: 'Ashok Patnaik',
        reviewNote: 'OSPCB authorized recycler manifest verified',
      });
    }
  }

  if (hyderabadSiteId) {
    const solarExisting = await db.orm.public.EsgRecords
      .where((r) => r.siteId.eq(hyderabadSiteId))
      .where((r) => r.period.eq('2026-05'))
      .where((r) => r.metricCode.eq('electricity'))
      .first();

    if (!solarExisting) {
      await db.orm.public.EsgRecords.create({
        site: 'Hyderabad Solar Hub',
        period: '2026-05',
        pillar: 'environmental',
        metric: 'On-site Renewable Solar Generation',
        metricCode: 'electricity',
        value: '120000',
        unit: 'kWh',
        rawValue: '120',
        rawUnit: 'MWh',
        formula: 'kWh = MWh × 1000',
        enteredBy: 'Priyanka Mohanty',
        role: 'engineer',
        evidence: 'grid_utility_meter_may2026.pdf',
        evidenceId: ev2.id,
        notes: 'Solar PV rooftop & ground mount generation export',
        siteId: hyderabadSiteId,
        reviewStatus: 'approved',
        reviewedBy: 'Ashok Patnaik',
        reviewNote: 'Inverter SCADA telemetry feed verified',
      });
    }
  }

  console.log('Seeding completed successfully with Prisma ORM!');
}

if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(async () => {
      await db.close();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('Seed error:', err);
      await db.close().catch(() => {});
      process.exit(1);
    });
}
