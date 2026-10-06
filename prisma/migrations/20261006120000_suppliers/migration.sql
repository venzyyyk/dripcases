-- Поставщики: роль SUPPLIER и привязка товара к поставщику
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SUPPLIER';
ALTER TABLE "products" ADD COLUMN "supplierId" TEXT;
ALTER TABLE "products" ADD CONSTRAINT "products_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
