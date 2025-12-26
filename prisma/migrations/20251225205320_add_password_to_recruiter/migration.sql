-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Recruiter" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL DEFAULT 'password'
);
INSERT INTO "new_Recruiter" ("email", "id", "name") SELECT "email", "id", "name" FROM "Recruiter";
DROP TABLE "Recruiter";
ALTER TABLE "new_Recruiter" RENAME TO "Recruiter";
CREATE UNIQUE INDEX "Recruiter_email_key" ON "Recruiter"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
