import mysql from 'mysql2/promise';

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  // Create gift_tokens table if not exists
  await conn.query(`
    CREATE TABLE IF NOT EXISTS gift_tokens (
      id int AUTO_INCREMENT NOT NULL,
      sourceUserId varchar(255) NOT NULL,
      sourceHouseId int NOT NULL,
      targetUserId varchar(255),
      targetHouseId int,
      targetEmail varchar(255),
      targetName varchar(255),
      giftType enum('mirror','adaptive','locked') NOT NULL,
      giftValue decimal(20,8),
      giftDescription text,
      giftMessage text,
      requiresAnniversary boolean DEFAULT false,
      anniversaryDate timestamp,
      requiresStewardshipScrolls boolean DEFAULT false,
      requiredScrolls json,
      lockDurationDays int,
      lockExpiresAt timestamp,
      requiresLineageVerification boolean DEFAULT false,
      lineageVerified boolean DEFAULT false,
      lineageVerifiedAt timestamp,
      lineageVerifiedBy varchar(255),
      giftStatus enum('pending','awaiting_activation','activated','claimed','expired','revoked') NOT NULL DEFAULT 'pending',
      activatedAt timestamp,
      claimedAt timestamp,
      revokedAt timestamp,
      revokeReason text,
      giftHash varchar(64),
      redemptionCode varchar(32),
      deliveryMethod enum('email','qr_code','direct_link','in_person'),
      deliveryStatus enum('pending','sent','delivered','failed') DEFAULT 'pending',
      deliverySentAt timestamp,
      createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT gift_tokens_id PRIMARY KEY(id),
      UNIQUE KEY gift_tokens_redemptionCode_unique (redemptionCode)
    )
  `);
  console.log('gift_tokens table created/verified');

  // Add new columns to waitlist_signups (ignore if already exist)
  const addCols = [
    "ALTER TABLE waitlist_signups ADD COLUMN fullName varchar(255)",
    "ALTER TABLE waitlist_signups ADD COLUMN interestCategories json",
    "ALTER TABLE waitlist_signups ADD COLUMN referralCode varchar(32)",
  ];
  
  for (const sql of addCols) {
    try {
      await conn.query(sql);
      console.log('Added column:', sql.split('ADD COLUMN ')[1]);
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME' || e.errno === 1060) {
        console.log('Column already exists:', sql.split('ADD COLUMN ')[1]);
      } else {
        console.error('Error:', e.message);
      }
    }
  }

  // Also create related tables if they don't exist
  await conn.query(`
    CREATE TABLE IF NOT EXISTS gift_activation_attempts (
      id int AUTO_INCREMENT NOT NULL,
      giftId int NOT NULL,
      userId varchar(255) NOT NULL,
      attemptStatus enum('approved','denied') NOT NULL,
      anniversaryMet boolean DEFAULT true,
      scrollsComplete boolean DEFAULT true,
      lineageVerified boolean DEFAULT true,
      lockExpired boolean DEFAULT true,
      resultMessage text,
      createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT gift_activation_attempts_id PRIMARY KEY(id)
    )
  `);
  console.log('gift_activation_attempts table created/verified');

  await conn.query(`
    CREATE TABLE IF NOT EXISTS gift_sale_ratios (
      id int AUTO_INCREMENT NOT NULL,
      houseId int NOT NULL,
      totalSalesCompleted int DEFAULT 0,
      totalGiftsIssued int DEFAULT 0,
      currentRatio decimal(10,4) DEFAULT 0,
      globalRatioTarget decimal(10,4) DEFAULT 3.0,
      houseRatioTarget decimal(10,4) DEFAULT 2.0,
      isCompliant boolean DEFAULT true,
      giftingBlocked boolean DEFAULT false,
      blockReason text,
      createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT gift_sale_ratios_id PRIMARY KEY(id)
    )
  `);
  console.log('gift_sale_ratios table created/verified');

  // Mark migration 0026 as applied so drizzle doesn't try to re-run it
  // (We've manually applied the changes)
  
  await conn.end();
  console.log('Database schema updated successfully');
}

main().catch(e => {
  console.error('Fatal error:', e.message);
  process.exit(1);
});
