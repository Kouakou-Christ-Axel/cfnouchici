-- AlterTable
ALTER TABLE "exemple" ADD COLUMN     "sensId" TEXT;

-- CreateTable
CREATE TABLE "sens" (
    "id" TEXT NOT NULL,
    "motId" TEXT NOT NULL,
    "categorie" "Categorie" NOT NULL,
    "definition" TEXT NOT NULL,
    "traductions" TEXT[],
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sens_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "exemple" ADD CONSTRAINT "exemple_sensId_fkey" FOREIGN KEY ("sensId") REFERENCES "sens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sens" ADD CONSTRAINT "sens_motId_fkey" FOREIGN KEY ("motId") REFERENCES "mot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
