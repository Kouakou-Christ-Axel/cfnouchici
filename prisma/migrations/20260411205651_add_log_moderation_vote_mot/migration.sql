-- CreateEnum
CREATE TYPE "ActionModeration" AS ENUM ('VALIDE', 'REJETE', 'EDITE');

-- CreateEnum
CREATE TYPE "Connaissance" AS ENUM ('OUI_UTILISE', 'CONNAIS', 'JAMAIS_ENTENDU');

-- CreateEnum
CREATE TYPE "Exactitude" AS ENUM ('EXACTE', 'APPROXIMATIVE', 'FAUSSE');

-- CreateTable
CREATE TABLE "log_moderation" (
    "id" TEXT NOT NULL,
    "action" "ActionModeration" NOT NULL,
    "motif" TEXT,
    "motId" TEXT NOT NULL,
    "moderateurId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_moderation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vote_mot" (
    "id" TEXT NOT NULL,
    "motId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "connaissance" "Connaissance" NOT NULL,
    "exactitude" "Exactitude" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vote_mot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vote_mot_motId_userId_key" ON "vote_mot"("motId", "userId");

-- AddForeignKey
ALTER TABLE "log_moderation" ADD CONSTRAINT "log_moderation_motId_fkey" FOREIGN KEY ("motId") REFERENCES "mot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_moderation" ADD CONSTRAINT "log_moderation_moderateurId_fkey" FOREIGN KEY ("moderateurId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vote_mot" ADD CONSTRAINT "vote_mot_motId_fkey" FOREIGN KEY ("motId") REFERENCES "mot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vote_mot" ADD CONSTRAINT "vote_mot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
