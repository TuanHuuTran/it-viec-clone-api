  -- AlterTable
  ALTER TABLE "roles" ALTER COLUMN "name" SET DEFAULT 'CANDIDATE';

  -- AlterTable
  ALTER TABLE "users" ADD COLUMN     "tokenVersion" INTEGER NOT NULL DEFAULT 0;
