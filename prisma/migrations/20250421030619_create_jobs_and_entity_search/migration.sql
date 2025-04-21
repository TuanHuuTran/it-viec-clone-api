-- CreateEnum
CREATE TYPE "JobLevel" AS ENUM ('INTERN', 'FRESHER', 'JUNIOR', 'MIDDLE', 'SENIOR', 'LEADER', 'MANAGER', 'DIRECTOR', 'C_LEVEL');

-- CreateEnum
CREATE TYPE "WorkingModel" AS ENUM ('ONSITE', 'REMOTE', 'HYBRID');

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT,
    "benefits" TEXT,
    "level" "JobLevel" NOT NULL,
    "minSalary" DOUBLE PRECISION,
    "maxSalary" DOUBLE PRECISION,
    "showSalary" BOOLEAN NOT NULL DEFAULT false,
    "workingModel" "WorkingModel" NOT NULL,
    "locationId" TEXT NOT NULL,
    "industryId" TEXT NOT NULL,
    "employerId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "District" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "District_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobDistrict" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "districtId" TEXT NOT NULL,

    CONSTRAINT "JobDistrict_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Industry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Industry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSkill" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "JobSkill_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Job_level_idx" ON "Job"("level");

-- CreateIndex
CREATE INDEX "Job_workingModel_idx" ON "Job"("workingModel");

-- CreateIndex
CREATE INDEX "Job_minSalary_maxSalary_idx" ON "Job"("minSalary", "maxSalary");

-- CreateIndex
CREATE INDEX "Job_locationId_idx" ON "Job"("locationId");

-- CreateIndex
CREATE INDEX "Job_industryId_idx" ON "Job"("industryId");

-- CreateIndex
CREATE INDEX "Job_isActive_idx" ON "Job"("isActive");

-- CreateIndex
CREATE INDEX "Job_title_idx" ON "Job"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Location_name_key" ON "Location"("name");

-- CreateIndex
CREATE INDEX "District_locationId_idx" ON "District"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "District_name_locationId_key" ON "District"("name", "locationId");

-- CreateIndex
CREATE INDEX "JobDistrict_jobId_idx" ON "JobDistrict"("jobId");

-- CreateIndex
CREATE INDEX "JobDistrict_districtId_idx" ON "JobDistrict"("districtId");

-- CreateIndex
CREATE UNIQUE INDEX "JobDistrict_jobId_districtId_key" ON "JobDistrict"("jobId", "districtId");

-- CreateIndex
CREATE UNIQUE INDEX "Industry_name_key" ON "Industry"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_name_key" ON "Skill"("name");

-- CreateIndex
CREATE INDEX "JobSkill_jobId_idx" ON "JobSkill"("jobId");

-- CreateIndex
CREATE INDEX "JobSkill_skillId_idx" ON "JobSkill"("skillId");

-- CreateIndex
CREATE INDEX "JobSkill_isPrimary_idx" ON "JobSkill"("isPrimary");

-- CreateIndex
CREATE UNIQUE INDEX "JobSkill_jobId_skillId_key" ON "JobSkill"("jobId", "skillId");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "Industry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "employer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "District" ADD CONSTRAINT "District_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobDistrict" ADD CONSTRAINT "JobDistrict_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobDistrict" ADD CONSTRAINT "JobDistrict_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSkill" ADD CONSTRAINT "JobSkill_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSkill" ADD CONSTRAINT "JobSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
