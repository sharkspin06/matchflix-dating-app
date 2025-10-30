-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "education" TEXT,
ADD COLUMN     "zodiac" TEXT,
ALTER COLUMN "preferredAgeMax" SET DEFAULT 50;
