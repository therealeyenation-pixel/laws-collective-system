import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Award, Shield, Building2, Landmark, Users, Printer, GraduationCap } from "lucide-react";

interface CertificateProps {
  recipientName: string;
  entityName: string;
  entityType: "llc" | "trust" | "nonprofit" | "collective";
  completionDate: string;
  certificateNumber: string;
  managerName: string;
  managerTitle: string;
  trainingManagerName?: string;
  trainingManagerTitle?: string;
  tokensEarned?: number;
}

const ENTITY_LABELS: Record<string, string> = {
  llc: "Limited Liability Company Formation",
  trust: "Family Trust Establishment",
  nonprofit: "508(c)(1)(A) Nonprofit Formation",
  collective: "Collective/Cooperative Formation",
};

const ENTITY_ICONS: Record<string, React.ReactNode> = {
  llc: <Building2 className="w-8 h-8" />,
  trust: <Shield className="w-8 h-8" />,
  nonprofit: <Landmark className="w-8 h-8" />,
  collective: <Users className="w-8 h-8" />,
};

export default function CompletionCertificate({
  recipientName,
  entityName,
  entityType,
  completionDate,
  certificateNumber,
  managerName,
  managerTitle,
  trainingManagerName = "Cornelius",
  trainingManagerTitle = "Education Manager",
  tokensEarned = 500,
}: CertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real implementation, this would generate a PDF
    // For now, we'll trigger print which allows saving as PDF
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex gap-2 justify-end print:hidden">
        <Button variant="outline" onClick={handlePrint} className="gap-2">
          <Printer className="w-4 h-4" />
          Print
        </Button>
        <Button onClick={handleDownload} className="gap-2">
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
      </div>

      {/* Certificate */}
      <div 
        ref={certificateRef}
        className="bg-white border-8 border-double border-amber-600 rounded-lg p-8 md:p-12 max-w-3xl mx-auto print:border-4"
        style={{
          background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fffbeb 100%)",
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-amber-100 rounded-full border-2 border-amber-500">
              <Award className="w-12 h-12 text-amber-600" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-amber-900 mb-2">
            Certificate of Completion
          </h1>
          <div className="w-32 h-1 bg-amber-500 mx-auto" />
        </div>

        {/* Body */}
        <div className="text-center space-y-6 mb-8">
          <p className="text-lg text-amber-800">This is to certify that</p>
          
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-amber-900 border-b-2 border-amber-400 pb-2 inline-block px-8">
            {recipientName}
          </h2>
          
          <p className="text-lg text-amber-800">
            has successfully completed the
          </p>
          
          <div className="flex items-center justify-center gap-3">
            <div className="text-amber-600">
              {ENTITY_ICONS[entityType]}
            </div>
            <h3 className="text-xl md:text-2xl font-semibold text-amber-900">
              {ENTITY_LABELS[entityType]}
            </h3>
          </div>
          
          <p className="text-lg text-amber-800">
            Training Simulator
          </p>

          {entityName && (
            <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 inline-block">
              <p className="text-sm text-amber-700">Entity Created:</p>
              <p className="text-xl font-semibold text-amber-900">{entityName}</p>
            </div>
          )}
        </div>

        {/* Tokens Earned */}
        {tokensEarned > 0 && (
          <div className="flex justify-center mb-8">
            <Badge className="bg-green-100 text-green-800 border-green-300 text-lg px-4 py-2">
              <Award className="w-5 h-5 mr-2" />
              {tokensEarned} LUV Tokens Earned
            </Badge>
          </div>
        )}

        {/* Footer with Dual Signatures */}
        <div className="border-t-2 border-amber-300 pt-6">
          <div className="grid md:grid-cols-2 gap-6 text-center mb-6">
            <div>
              <p className="text-sm text-amber-700">Date of Completion</p>
              <p className="font-semibold text-amber-900">{completionDate}</p>
            </div>
            
            <div>
              <p className="text-sm text-amber-700">Certificate Number</p>
              <p className="font-mono text-amber-900">{certificateNumber}</p>
            </div>
          </div>

          {/* Dual Signature Section */}
          <div className="grid md:grid-cols-2 gap-8 mt-8">
            {/* Simulator Manager Signature */}
            <div className="text-center">
              <div className="border-b-2 border-amber-400 pb-1 mb-1 mx-8">
                <p className="font-serif italic text-amber-900">{managerName}</p>
              </div>
              <p className="text-sm text-amber-700">{managerTitle}</p>
              <p className="text-xs text-amber-600">Simulator Manager</p>
            </div>

            {/* Training Manager Signature */}
            <div className="text-center">
              <div className="border-b-2 border-amber-400 pb-1 mb-1 mx-8">
                <p className="font-serif italic text-amber-900">{trainingManagerName}</p>
              </div>
              <p className="text-sm text-amber-700">{trainingManagerTitle}</p>
              <div className="flex items-center justify-center gap-1 text-xs text-amber-600">
                <GraduationCap className="w-3 h-3" />
                <span>Content Approved</span>
              </div>
            </div>
          </div>
        </div>

        {/* Seal */}
        <div className="flex justify-center mt-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-amber-600 flex items-center justify-center bg-amber-50">
              <div className="text-center">
                <Shield className="w-8 h-8 text-amber-600 mx-auto" />
                <p className="text-xs font-bold text-amber-800">L.A.W.S.</p>
              </div>
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-xs px-3 py-1 rounded">
              VERIFIED
            </div>
          </div>
        </div>

        {/* Legal Notice */}
        <p className="text-xs text-center text-amber-600 mt-8">
          This certificate acknowledges completion of the training simulator and successful entity formation.
          <br />
          Training content reviewed and approved by the Education Department.
          <br />
          LuvOnPurpose Sovereign System • The L.A.W.S. Collective, LLC
        </p>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          [data-certificate], [data-certificate] * {
            visibility: visible;
          }
          [data-certificate] {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
