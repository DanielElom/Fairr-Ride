import { Pool } from 'pg';

async function main() {
  const pool = new Pool({ connectionString: process.env['DATABASE_URL'] });

  const result = await pool.query(
    `INSERT INTO "User" (id, phone, name, role, status, "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())
     ON CONFLICT (phone) DO UPDATE
       SET name = EXCLUDED.name, role = EXCLUDED.role, status = EXCLUDED.status, "updatedAt" = NOW()
     RETURNING id, phone, name, role, status`,
    ['+2340000000000', 'Fair-Ride Admin', 'ADMIN', 'ACTIVE'],
  );

  console.log('Seeded admin user:', result.rows[0]);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
