CREATE TABLE "kidrue_articles" (
 "id" TEXT PRIMARY KEY, "title" TEXT NOT NULL, "description" TEXT NOT NULL DEFAULT '',
 "category" TEXT NOT NULL, "tags" TEXT[] NOT NULL, "body" TEXT NOT NULL,
 "coverUrl" TEXT NOT NULL DEFAULT '', "status" TEXT NOT NULL DEFAULT 'draft',
 "date" TEXT NOT NULL, "readTime" INTEGER NOT NULL DEFAULT 1, "revision" INTEGER NOT NULL DEFAULT 1,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "kidrue_articles_status_updatedAt_idx" ON "kidrue_articles"("status", "updatedAt");
CREATE TABLE "kidrue_sessions" ("id" TEXT PRIMARY KEY, "expiresAt" TIMESTAMP(3) NOT NULL);
CREATE INDEX "kidrue_sessions_expiresAt_idx" ON "kidrue_sessions"("expiresAt");
