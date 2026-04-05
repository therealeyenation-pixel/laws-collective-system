import 'dotenv/config';
import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

async function testPayroll() {
  const connection = await mysql.createConnection(DATABASE_URL);
  
  try {
    // Get a position with holder
    const [positions] = await connection.execute(
      "SELECT bp.id, bp.title, bp.houseId, bp.businessEntityId, bp.compensationType, bp.salaryAmount, bp.payFrequency FROM business_positions bp WHERE bp.status = 'filled' LIMIT 1"
    );
    console.log('Position:', positions[0]);
    
    // Get position holder
    const [holders] = await connection.execute(
      "SELECT id, positionId FROM position_holders LIMIT 1"
    );
    console.log('Holder:', holders[0]);
    
    if (positions.length > 0 && holders.length > 0) {
      const position = positions[0];
      const holder = holders[0];
      
      // Check if houseId is null
      console.log('Position houseId:', position.houseId);
      console.log('Position businessEntityId:', position.businessEntityId);
      
      // Try to insert a payroll record
      const grossPay = 4500;
      const netPay = 3500;
      const totalDeductions = 1000;
      
      const [result] = await connection.execute(
        `INSERT INTO payroll_records (
          positionHolderId, positionId, businessEntityId, houseId,
          payPeriodStart, payPeriodEnd, payDate,
          regularHours, overtimeHours,
          grossPay, regularPay, overtimePay, bonusPay, commissionPay,
          federalIncomeTax, stateIncomeTax, socialSecurityTax, medicareTax,
          totalDeductions, netPay,
          employerSocialSecurity, employerMedicare, employerFuta, employerSuta,
          paymentMethod, status, createdBy
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          holder.id, position.id, position.businessEntityId, position.houseId || 1,
          '2026-01-01', '2026-01-15', '2026-01-22',
          '80', '0',
          grossPay.toFixed(2), grossPay.toFixed(2), '0.00', '0.00', '0.00',
          '990.00', '225.00', '279.00', '65.25',
          totalDeductions.toFixed(2), netPay.toFixed(2),
          '279.00', '65.25', '27.00', '121.50',
          'direct_deposit', 'pending', 1
        ]
      );
      
      console.log('Insert result:', result);
      console.log('Payroll record inserted with ID:', result.insertId);
    }
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await connection.end();
  }
}

testPayroll();
