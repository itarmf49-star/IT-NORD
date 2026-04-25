-- AlterTable
ALTER TABLE "ServiceProduct" ADD COLUMN     "color" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "postsIncluded" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "info" TEXT,
ADD COLUMN     "phone" TEXT;
