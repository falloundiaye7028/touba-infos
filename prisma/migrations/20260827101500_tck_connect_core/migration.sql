-- TCK CONNECT core: identity, contributions, projects, controlled expenses and audit.
CREATE TYPE "TckRole" AS ENUM ('ADMIN', 'COLLECTOR', 'COMMISSION_MANAGER', 'CONTROLLER', 'MEMBER');
CREATE TYPE "TckMemberStatus" AS ENUM ('ACTIVE', 'TO_FOLLOW_UP', 'SUSPENDED');
CREATE TYPE "TckProjectStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'FINALIZATION', 'COMPLETED');
CREATE TYPE "TckExpenseStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PAID');

CREATE TABLE "tck_members" (
  "id" TEXT NOT NULL,
  "memberCode" TEXT NOT NULL,
  "userId" TEXT,
  "name" TEXT NOT NULL,
  "phone" TEXT,
  "zone" TEXT,
  "country" TEXT NOT NULL DEFAULT 'SN',
  "status" "TckMemberStatus" NOT NULL DEFAULT 'ACTIVE',
  "role" "TckRole" NOT NULL DEFAULT 'MEMBER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "tck_members_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tck_contributions" (
  "id" TEXT NOT NULL,
  "receiptNumber" TEXT NOT NULL,
  "memberId" TEXT,
  "recordedById" TEXT,
  "amount" INTEGER NOT NULL,
  "channel" TEXT NOT NULL,
  "externalReference" TEXT,
  "status" TEXT NOT NULL DEFAULT 'VALIDATED',
  "contributedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "tck_contributions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tck_projects" (
  "id" TEXT NOT NULL,
  "projectCode" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "domain" TEXT NOT NULL,
  "place" TEXT,
  "budget" INTEGER NOT NULL DEFAULT 0,
  "spent" INTEGER NOT NULL DEFAULT 0,
  "progress" INTEGER NOT NULL DEFAULT 0,
  "status" "TckProjectStatus" NOT NULL DEFAULT 'PLANNED',
  "public" BOOLEAN NOT NULL DEFAULT true,
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "tck_projects_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tck_expenses" (
  "id" TEXT NOT NULL,
  "expenseNumber" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "commission" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "justification" TEXT NOT NULL,
  "status" "TckExpenseStatus" NOT NULL DEFAULT 'PENDING',
  "required" INTEGER NOT NULL DEFAULT 13,
  "submittedById" TEXT,
  "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "approvedAt" TIMESTAMP(3),
  "paidAt" TIMESTAMP(3),
  CONSTRAINT "tck_expenses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tck_expense_approvals" (
  "id" TEXT NOT NULL,
  "expenseId" TEXT NOT NULL,
  "approverId" TEXT NOT NULL,
  "decision" TEXT NOT NULL DEFAULT 'APPROVED',
  "comment" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "tck_expense_approvals_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tck_audit_events" (
  "id" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "entity" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "actorId" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "tck_audit_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tck_members_memberCode_key" ON "tck_members"("memberCode");
CREATE UNIQUE INDEX "tck_members_userId_key" ON "tck_members"("userId");
CREATE INDEX "tck_members_status_idx" ON "tck_members"("status");
CREATE INDEX "tck_members_role_idx" ON "tck_members"("role");
CREATE INDEX "tck_members_zone_idx" ON "tck_members"("zone");
CREATE UNIQUE INDEX "tck_contributions_receiptNumber_key" ON "tck_contributions"("receiptNumber");
CREATE UNIQUE INDEX "tck_contributions_externalReference_key" ON "tck_contributions"("externalReference");
CREATE INDEX "tck_contributions_memberId_idx" ON "tck_contributions"("memberId");
CREATE INDEX "tck_contributions_contributedAt_idx" ON "tck_contributions"("contributedAt");
CREATE INDEX "tck_contributions_channel_idx" ON "tck_contributions"("channel");
CREATE UNIQUE INDEX "tck_projects_projectCode_key" ON "tck_projects"("projectCode");
CREATE INDEX "tck_projects_status_idx" ON "tck_projects"("status");
CREATE INDEX "tck_projects_domain_idx" ON "tck_projects"("domain");
CREATE UNIQUE INDEX "tck_expenses_expenseNumber_key" ON "tck_expenses"("expenseNumber");
CREATE INDEX "tck_expenses_status_idx" ON "tck_expenses"("status");
CREATE INDEX "tck_expenses_commission_idx" ON "tck_expenses"("commission");
CREATE UNIQUE INDEX "tck_expense_approvals_expenseId_approverId_key" ON "tck_expense_approvals"("expenseId", "approverId");
CREATE INDEX "tck_expense_approvals_approverId_idx" ON "tck_expense_approvals"("approverId");
CREATE INDEX "tck_audit_events_entity_entityId_idx" ON "tck_audit_events"("entity", "entityId");
CREATE INDEX "tck_audit_events_createdAt_idx" ON "tck_audit_events"("createdAt");

ALTER TABLE "tck_members" ADD CONSTRAINT "tck_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tck_contributions" ADD CONSTRAINT "tck_contributions_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "tck_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tck_contributions" ADD CONSTRAINT "tck_contributions_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "tck_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tck_projects" ADD CONSTRAINT "tck_projects_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "tck_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tck_expenses" ADD CONSTRAINT "tck_expenses_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "tck_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tck_expense_approvals" ADD CONSTRAINT "tck_expense_approvals_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "tck_expenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tck_expense_approvals" ADD CONSTRAINT "tck_expense_approvals_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "tck_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tck_audit_events" ADD CONSTRAINT "tck_audit_events_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "tck_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
