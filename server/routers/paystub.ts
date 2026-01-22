import { Router } from "express";
import mysql from "mysql2/promise";

const router = Router();

router.get("/paystub/:id", async (req, res) => {
  let connection: mysql.Connection | null = null;
  
  try {
    const payrollId = parseInt(req.params.id);
    console.log("[PayStub] Generating pay stub for ID:", payrollId);
    
    if (!process.env.DATABASE_URL) {
      console.error("[PayStub] DATABASE_URL not set");
      return res.status(500).json({ error: "Database not configured" });
    }
    
    connection = await mysql.createConnection(process.env.DATABASE_URL);
    console.log("[PayStub] Database connected");
    
    // Use raw SQL query with mysql2 directly
    const [rows] = await connection.execute(`
      SELECT 
        pr.id,
        pr.payPeriodStart,
        pr.payPeriodEnd,
        pr.payDate,
        pr.regularHours,
        pr.overtimeHours,
        pr.grossPay,
        pr.federalIncomeTax,
        pr.stateIncomeTax,
        pr.socialSecurityTax,
        pr.medicareTax,
        pr.netPay,
        pr.totalDeductions,
        ph.fullName as employeeName,
        bp.title as positionTitle,
        bp.salaryAmount as salary
      FROM payroll_records pr
      INNER JOIN position_holders ph ON pr.positionHolderId = ph.id
      INNER JOIN business_positions bp ON ph.positionId = bp.id
      WHERE pr.id = ?
      LIMIT 1
    `, [payrollId]);

    console.log("[PayStub] Query result:", JSON.stringify(rows));

    const rowsArray = rows as any[];
    if (!rowsArray || rowsArray.length === 0) {
      console.log("[PayStub] Payroll record not found");
      return res.status(404).json({ error: "Payroll record not found" });
    }

    const payroll = rowsArray[0];
    const employeeName = payroll.employeeName || "Employee";
    console.log("[PayStub] Generating HTML for:", employeeName);

    const formatCurrency = (val: any) => {
      const num = parseFloat(val || "0");
      return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    // Generate HTML pay stub
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Pay Stub - ${employeeName}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; border-bottom: 2px solid #166534; padding-bottom: 20px; margin-bottom: 20px; }
    .company { font-size: 24px; font-weight: bold; color: #166534; }
    .title { font-size: 18px; color: #666; margin-top: 5px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .info-box { background: #f5f5f5; padding: 15px; border-radius: 8px; }
    .info-box h3 { margin: 0 0 10px 0; color: #166534; font-size: 14px; text-transform: uppercase; }
    .info-box p { margin: 5px 0; }
    .earnings-table, .deductions-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .earnings-table th, .deductions-table th { background: #166534; color: white; padding: 10px; text-align: left; }
    .earnings-table td, .deductions-table td { padding: 10px; border-bottom: 1px solid #ddd; }
    .total-row { font-weight: bold; background: #f0f9f0; }
    .net-pay { text-align: center; background: #166534; color: white; padding: 20px; border-radius: 8px; margin-top: 20px; }
    .net-pay .amount { font-size: 32px; font-weight: bold; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
    .print-btn { display: block; margin: 20px auto; padding: 10px 30px; background: #166534; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; }
    .print-btn:hover { background: #14532d; }
    @media print { body { padding: 0; } .print-btn { display: none; } }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">Print Pay Stub</button>
  <div class="header">
    <div class="company">The L.A.W.S. Collective, LLC</div>
    <div class="title">Pay Stub</div>
  </div>
  <div class="info-grid">
    <div class="info-box">
      <h3>Employee Information</h3>
      <p><strong>Name:</strong> ${employeeName}</p>
      <p><strong>Position:</strong> ${payroll.positionTitle || 'N/A'}</p>
      <p><strong>Annual Salary:</strong> $${formatCurrency(payroll.salary)}</p>
    </div>
    <div class="info-box">
      <h3>Pay Period</h3>
      <p><strong>Start:</strong> ${payroll.payPeriodStart ? new Date(payroll.payPeriodStart).toLocaleDateString() : 'N/A'}</p>
      <p><strong>End:</strong> ${payroll.payPeriodEnd ? new Date(payroll.payPeriodEnd).toLocaleDateString() : 'N/A'}</p>
      <p><strong>Pay Date:</strong> ${payroll.payDate ? new Date(payroll.payDate).toLocaleDateString() : 'N/A'}</p>
    </div>
  </div>
  <h3 style="color: #166534;">Earnings</h3>
  <table class="earnings-table">
    <thead><tr><th>Description</th><th>Hours</th><th>Amount</th></tr></thead>
    <tbody>
      <tr><td>Regular Pay</td><td>${payroll.regularHours || 80}</td><td>$${formatCurrency(payroll.grossPay)}</td></tr>
      <tr class="total-row"><td colspan="2">Gross Pay</td><td>$${formatCurrency(payroll.grossPay)}</td></tr>
    </tbody>
  </table>
  <h3 style="color: #166534;">Deductions</h3>
  <table class="deductions-table">
    <thead><tr><th>Description</th><th>Amount</th></tr></thead>
    <tbody>
      <tr><td>Federal Income Tax</td><td>$${formatCurrency(payroll.federalIncomeTax)}</td></tr>
      <tr><td>State Income Tax (GA)</td><td>$${formatCurrency(payroll.stateIncomeTax)}</td></tr>
      <tr><td>Social Security (6.2%)</td><td>$${formatCurrency(payroll.socialSecurityTax)}</td></tr>
      <tr><td>Medicare (1.45%)</td><td>$${formatCurrency(payroll.medicareTax)}</td></tr>
      <tr class="total-row"><td>Total Deductions</td><td>$${formatCurrency(payroll.totalDeductions)}</td></tr>
    </tbody>
  </table>
  <div class="net-pay">
    <div>Net Pay</div>
    <div class="amount">$${formatCurrency(payroll.netPay)}</div>
  </div>
  <div class="footer">
    <p>This is an official pay stub from The L.A.W.S. Collective, LLC</p>
    <p>Generated on ${new Date().toLocaleDateString()}</p>
  </div>
</body>
</html>`;

    console.log("[PayStub] Sending HTML response");
    res.setHeader("Content-Type", "text/html");
    res.send(html);
  } catch (error: any) {
    console.error("[PayStub] Error generating pay stub:", error);
    console.error("[PayStub] Error stack:", error?.stack);
    res.status(500).json({ error: "Failed to generate pay stub", details: error?.message });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

export default router;
