-- CreateTable
CREATE TABLE "PortalAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "company" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PortalAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortalInvoice" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PortalInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortalInvoiceItem" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PortalInvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortalMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PortalMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PortalAccount_userId_idx" ON "PortalAccount"("userId");

-- CreateIndex
CREATE INDEX "PortalInvoice_accountId_idx" ON "PortalInvoice"("accountId");

-- CreateIndex
CREATE INDEX "PortalInvoice_status_idx" ON "PortalInvoice"("status");

-- CreateIndex
CREATE INDEX "PortalInvoice_issuedAt_idx" ON "PortalInvoice"("issuedAt");

-- CreateIndex
CREATE INDEX "PortalInvoiceItem_invoiceId_idx" ON "PortalInvoiceItem"("invoiceId");

-- CreateIndex
CREATE INDEX "PortalMessage_userId_idx" ON "PortalMessage"("userId");

-- CreateIndex
CREATE INDEX "PortalMessage_createdAt_idx" ON "PortalMessage"("createdAt");

-- AddForeignKey
ALTER TABLE "PortalAccount" ADD CONSTRAINT "PortalAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalInvoice" ADD CONSTRAINT "PortalInvoice_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "PortalAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalInvoiceItem" ADD CONSTRAINT "PortalInvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "PortalInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalMessage" ADD CONSTRAINT "PortalMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
