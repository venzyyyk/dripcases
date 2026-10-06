-- Инвентарь: статусы «забран» и «продан обратно»
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'KEPT';
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'SOLD';
