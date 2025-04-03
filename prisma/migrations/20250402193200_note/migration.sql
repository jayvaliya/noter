/*
  Warnings:

  - You are about to drop the column `userId` on the `Note` table. All the data in the column will be lost.
  - Added the required column `authorId` to the `Note` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_userId_fkey";

-- AlterTable
ALTER TABLE "Note" DROP COLUMN "userId",
ADD COLUMN     "authorId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
