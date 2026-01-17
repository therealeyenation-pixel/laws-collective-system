import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, DollarSign, Calculator, Calendar, Receipt, 
  Building2, AlertTriangle, CheckCircle2, Info, Briefcase
} from "lucide-react";

interface LessonContentProps {
  moduleId: string;
}

export function ContractorLessonContent({ moduleId }: LessonContentProps) {
  const content = LESSON_CONTENT[moduleId];
  
  if (!content) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Lesson content loading...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="prose prose-sm max-w-none dark:prose-invert">
        {content}
      </div>
    </div>
  );
}

const LESSON_CONTENT: Record<string, React.ReactNode> = {
  "llc-8": (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Contractor Operations: Getting Started
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            As a contractor, you're running a business. This module covers the essential 
            operations you need to manage to get paid and stay compliant.
          </p>

          <Separator />

          <h3 className="font-semibold text-lg">1. Invoicing Basics</h3>
          <p>Every invoice should include:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Your business name and address</strong></li>
            <li><strong>Client's name and address</strong></li>
            <li><strong>Invoice number</strong> (sequential for tracking)</li>
            <li><strong>Date issued</strong> and <strong>due date</strong></li>
            <li><strong>Itemized services</strong> with descriptions and amounts</li>
            <li><strong>Total amount due</strong></li>
            <li><strong>Payment instructions</strong> (bank details, payment link, etc.)</li>
          </ul>

          <Alert>
            <Info className="w-4 h-4" />
            <AlertTitle>Payment Terms</AlertTitle>
            <AlertDescription>
              Common payment terms: <strong>Net 15</strong> (due in 15 days), 
              <strong> Net 30</strong> (due in 30 days), or <strong>Due Upon Receipt</strong>.
            </AlertDescription>
          </Alert>

          <Separator />

          <h3 className="font-semibold text-lg">2. Collecting W-9 Forms</h3>
          <p>
            Before you start work with a new client, you should provide them with a 
            <strong> W-9 form</strong>. This form gives them your:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Legal business name</li>
            <li>Business address</li>
            <li>Tax ID (EIN or SSN)</li>
            <li>Tax classification (LLC, Sole Prop, etc.)</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Clients need this to issue you a 1099-NEC at year-end if they pay you $600 or more.
          </p>

          <Separator />

          <h3 className="font-semibold text-lg">3. Understanding 1099-NEC</h3>
          <p>
            At year-end, clients who paid you <strong>$600 or more</strong> will send you a 
            <strong> 1099-NEC</strong> (Non-Employee Compensation) form. This reports your 
            income to the IRS.
          </p>
          
          <Alert variant="destructive">
            <AlertTriangle className="w-4 h-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Even if you don't receive a 1099, you must report ALL income on your taxes. 
              The IRS receives copies of all 1099s issued to you.
            </AlertDescription>
          </Alert>

          <Separator />

          <h3 className="font-semibold text-lg">4. Separate Business Banking</h3>
          <p>
            Open a dedicated business bank account to:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Keep personal and business finances separate</li>
            <li>Simplify bookkeeping and tax preparation</li>
            <li>Maintain liability protection</li>
            <li>Look professional to clients</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  ),

  "llc-9": (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Paying Yourself as a Contractor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            As an LLC owner, you have options for how to pay yourself. Understanding these 
            options helps you manage cash flow and minimize taxes.
          </p>

          <Separator />

          <h3 className="font-semibold text-lg">Owner's Draw vs. Salary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-primary/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Owner's Draw</CardTitle>
                <Badge variant="secondary">Default for LLCs</Badge>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>Taking money directly from business profits.</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>No payroll taxes withheld</li>
                  <li>Pay self-employment tax on all profits</li>
                  <li>Simple - just transfer money</li>
                  <li>Flexible timing and amounts</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-secondary/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Salary (W-2)</CardTitle>
                <Badge variant="outline">S-Corp Election Required</Badge>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>Paying yourself as an employee.</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Payroll taxes withheld</li>
                  <li>SE tax only on salary portion</li>
                  <li>Requires payroll setup</li>
                  <li>Must be "reasonable compensation"</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Separator />

          <h3 className="font-semibold text-lg">How to Take an Owner's Draw</h3>
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              <strong>Check your balance:</strong> Ensure the business has enough to cover 
              expenses, taxes, and your draw.
            </li>
            <li>
              <strong>Transfer funds:</strong> Move money from business account to personal account.
            </li>
            <li>
              <strong>Record the transaction:</strong> Log it as an owner's draw in your books 
              (not an expense).
            </li>
            <li>
              <strong>Set aside taxes:</strong> Put 25-30% aside for quarterly estimated taxes.
            </li>
          </ol>

          <Alert>
            <Calculator className="w-4 h-4" />
            <AlertTitle>Tax Tip</AlertTitle>
            <AlertDescription>
              Set aside 25-30% of each draw for taxes. Open a separate savings account 
              just for tax reserves so you're never caught short at tax time.
            </AlertDescription>
          </Alert>

          <Separator />

          <h3 className="font-semibold text-lg">Frequency Recommendations</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Weekly/Bi-weekly:</strong> If you need regular income like a paycheck</li>
            <li><strong>Monthly:</strong> Good for predictable expenses</li>
            <li><strong>Quarterly:</strong> Align with estimated tax payments</li>
            <li><strong>As-needed:</strong> When cash flow allows (less predictable)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  ),

  "llc-10": (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            S-Corp Election: When & How
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="w-4 h-4" />
            <AlertTitle>Key Concept</AlertTitle>
            <AlertDescription>
              S-Corp is NOT a type of business entity. It's a <strong>tax election</strong> that 
              changes how your LLC is taxed by the IRS.
            </AlertDescription>
          </Alert>

          <Separator />

          <h3 className="font-semibold text-lg">How S-Corp Saves Money</h3>
          <p>
            With a standard LLC, you pay <strong>15.3% self-employment tax</strong> on ALL profits. 
            With S-Corp election, you only pay SE tax on your salary - not on distributions.
          </p>

          <div className="bg-secondary/30 p-4 rounded-lg space-y-3">
            <h4 className="font-medium">Example: $100,000 Profit</h4>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-destructive">Standard LLC</p>
                <ul className="space-y-1">
                  <li>Profit: $100,000</li>
                  <li>SE Tax (15.3%): <span className="text-destructive">$15,300</span></li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-green-600">LLC with S-Corp</p>
                <ul className="space-y-1">
                  <li>Salary: $50,000</li>
                  <li>Distribution: $50,000</li>
                  <li>SE Tax (on salary): <span className="text-green-600">$7,650</span></li>
                </ul>
              </div>
            </div>
            
            <p className="text-sm font-medium text-green-600">
              Savings: ~$7,650/year
            </p>
          </div>

          <Separator />

          <h3 className="font-semibold text-lg">When S-Corp Makes Sense</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Consistent annual profits of <strong>$40,000-50,000+</strong></li>
            <li>You can justify a "reasonable salary" for your role</li>
            <li>You're willing to run payroll (or pay for a service)</li>
            <li>Tax savings exceed the cost of payroll administration</li>
          </ul>

          <Alert variant="destructive">
            <AlertTriangle className="w-4 h-4" />
            <AlertTitle>Reasonable Compensation Rule</AlertTitle>
            <AlertDescription>
              The IRS requires S-Corp owners to pay themselves a "reasonable salary" before 
              taking distributions. Setting salary too low triggers audits and penalties.
            </AlertDescription>
          </Alert>

          <Separator />

          <h3 className="font-semibold text-lg">How to Elect S-Corp Status</h3>
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              <strong>File Form 2553</strong> with the IRS (Election by a Small Business Corporation)
            </li>
            <li>
              <strong>Deadline:</strong> Within 75 days of formation, or by March 15 for the 
              current tax year
            </li>
            <li>
              <strong>Set up payroll</strong> to pay yourself a W-2 salary
            </li>
            <li>
              <strong>File Form 1120-S</strong> (S-Corp tax return) annually
            </li>
          </ol>

          <Separator />

          <h3 className="font-semibold text-lg">S-Corp Checklist</h3>
          <div className="space-y-2">
            {[
              "Profits consistently above $40,000-50,000/year",
              "Can determine reasonable salary for your industry",
              "Willing to run payroll (monthly or bi-weekly)",
              "Understand additional filing requirements (Form 1120-S)",
              "Tax savings exceed payroll service costs (~$500-1,500/year)",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  ),

  "llc-11": (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Quarterly Tax Obligations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            As a contractor, taxes aren't withheld from your income. You must pay 
            <strong> quarterly estimated taxes</strong> to avoid penalties.
          </p>

          <Separator />

          <h3 className="font-semibold text-lg">Self-Employment Tax</h3>
          <p>
            Self-employment tax covers Social Security and Medicare - the same taxes 
            that employers withhold from W-2 employees.
          </p>
          
          <div className="bg-secondary/30 p-4 rounded-lg">
            <p className="font-medium">Self-Employment Tax Rate: 15.3%</p>
            <ul className="text-sm mt-2 space-y-1">
              <li>Social Security: 12.4% (on first $168,600 in 2024)</li>
              <li>Medicare: 2.9% (on all income)</li>
              <li>Additional Medicare: 0.9% (on income over $200,000)</li>
            </ul>
          </div>

          <Separator />

          <h3 className="font-semibold text-lg">Quarterly Payment Deadlines</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { quarter: "Q1", period: "Jan-Mar", due: "April 15" },
              { quarter: "Q2", period: "Apr-May", due: "June 15" },
              { quarter: "Q3", period: "Jun-Aug", due: "September 15" },
              { quarter: "Q4", period: "Sep-Dec", due: "January 15" },
            ].map((q) => (
              <Card key={q.quarter} className="text-center">
                <CardContent className="pt-4">
                  <Badge className="mb-2">{q.quarter}</Badge>
                  <p className="text-xs text-muted-foreground">{q.period}</p>
                  <p className="font-medium text-sm mt-1">Due: {q.due}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator />

          <h3 className="font-semibold text-lg">How to Calculate Estimated Taxes</h3>
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              <strong>Estimate annual income:</strong> Project your total business income for the year
            </li>
            <li>
              <strong>Subtract deductions:</strong> Business expenses, home office, etc.
            </li>
            <li>
              <strong>Calculate SE tax:</strong> Net income × 15.3% (× 92.35% adjustment)
            </li>
            <li>
              <strong>Calculate income tax:</strong> Based on your tax bracket
            </li>
            <li>
              <strong>Divide by 4:</strong> Pay this amount each quarter
            </li>
          </ol>

          <Alert>
            <Calculator className="w-4 h-4" />
            <AlertTitle>Quick Estimate</AlertTitle>
            <AlertDescription>
              A safe estimate: Set aside <strong>25-30%</strong> of your net income for taxes. 
              This covers both self-employment tax and income tax for most contractors.
            </AlertDescription>
          </Alert>

          <Separator />

          <h3 className="font-semibold text-lg">How to Pay</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>IRS Direct Pay:</strong> irs.gov/payments (free, instant)</li>
            <li><strong>EFTPS:</strong> Electronic Federal Tax Payment System</li>
            <li><strong>Mail:</strong> Form 1040-ES with check (slower)</li>
          </ul>

          <Alert variant="destructive">
            <AlertTriangle className="w-4 h-4" />
            <AlertTitle>Underpayment Penalty</AlertTitle>
            <AlertDescription>
              If you don't pay enough throughout the year, the IRS charges an underpayment 
              penalty. Pay at least 90% of current year tax or 100% of last year's tax to avoid it.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  ),

  "llc-12": (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Deductions & Record Keeping
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Proper deductions reduce your taxable income. Good record keeping ensures you 
            can claim every deduction you're entitled to.
          </p>

          <Separator />

          <h3 className="font-semibold text-lg">Common Business Deductions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { name: "Home Office", desc: "Dedicated workspace in your home" },
              { name: "Vehicle/Mileage", desc: "Business travel (67¢/mile in 2024)" },
              { name: "Equipment", desc: "Computers, software, tools" },
              { name: "Office Supplies", desc: "Paper, ink, desk items" },
              { name: "Professional Services", desc: "Accounting, legal, consulting" },
              { name: "Insurance", desc: "Business liability, health (self-employed)" },
              { name: "Education", desc: "Courses, books, conferences" },
              { name: "Marketing", desc: "Website, ads, business cards" },
              { name: "Phone/Internet", desc: "Business portion of bills" },
              { name: "Travel", desc: "Business trips, lodging, meals (50%)" },
            ].map((d) => (
              <div key={d.name} className="flex items-start gap-2 p-2 rounded bg-secondary/30">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">{d.name}</p>
                  <p className="text-xs text-muted-foreground">{d.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          <h3 className="font-semibold text-lg">Home Office Deduction</h3>
          <p>To qualify, your home office must be used:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Regularly</strong> - Not just occasionally</li>
            <li><strong>Exclusively</strong> - Only for business (not a guest room)</li>
            <li><strong>As your principal place of business</strong></li>
          </ul>
          
          <div className="bg-secondary/30 p-4 rounded-lg mt-3">
            <p className="font-medium">Two Calculation Methods:</p>
            <ul className="text-sm mt-2 space-y-2">
              <li>
                <strong>Simplified:</strong> $5 per square foot (max 300 sq ft = $1,500)
              </li>
              <li>
                <strong>Regular:</strong> Actual expenses × (office sq ft ÷ home sq ft)
              </li>
            </ul>
          </div>

          <Separator />

          <h3 className="font-semibold text-lg">Mileage Tracking</h3>
          <p>For each business trip, record:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Date of travel</li>
            <li>Starting and ending locations</li>
            <li>Miles driven</li>
            <li>Business purpose</li>
          </ul>
          
          <Alert>
            <Info className="w-4 h-4" />
            <AlertTitle>2024 Standard Mileage Rate</AlertTitle>
            <AlertDescription>
              <strong>67 cents per mile</strong> for business use. 
              Commuting (home to regular office) is NOT deductible.
            </AlertDescription>
          </Alert>

          <Separator />

          <h3 className="font-semibold text-lg">Record Keeping Best Practices</h3>
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              <strong>Keep all receipts:</strong> Digital photos or scans are acceptable
            </li>
            <li>
              <strong>Use accounting software:</strong> QuickBooks, Wave, FreshBooks
            </li>
            <li>
              <strong>Separate accounts:</strong> Never mix personal and business
            </li>
            <li>
              <strong>Monthly reconciliation:</strong> Review transactions monthly
            </li>
            <li>
              <strong>Retain records 7 years:</strong> IRS can audit up to 6 years back
            </li>
          </ol>

          <Separator />

          <h3 className="font-semibold text-lg">Year-End Checklist</h3>
          <div className="space-y-2">
            {[
              "Gather all 1099s received",
              "Reconcile all bank/credit card statements",
              "Calculate total mileage for the year",
              "Measure home office square footage",
              "Organize receipts by category",
              "Calculate health insurance premiums paid",
              "Review retirement contributions (SEP-IRA, Solo 401k)",
              "Schedule meeting with tax professional",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  ),
};

export default ContractorLessonContent;
