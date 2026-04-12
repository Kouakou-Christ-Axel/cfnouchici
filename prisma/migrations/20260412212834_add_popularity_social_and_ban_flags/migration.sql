-- AlterTable
ALTER TABLE "mot" ADD COLUMN     "popularityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "socialNotes" TEXT,
ADD COLUMN     "socialScore" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "banned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "bannedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "mot_statut_popularityScore_idx" ON "mot"("statut", "popularityScore");
