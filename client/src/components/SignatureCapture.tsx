import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Save } from 'lucide-react';
import { canvasToBase64, createTypedSignature, SignatureType } from '@/lib/signatureOverlay';

interface SignatureCaptureProps {
  onSign: (signatureData: string, signatureType: SignatureType) => void;
  onCancel: () => void;
  signerName: string;
  signerTitle?: string;
}

export const SignatureCapture: React.FC<SignatureCaptureProps> = ({
  onSign,
  onCancel,
  signerName,
  signerTitle,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [typedName, setTypedName] = useState(signerName);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    setIsDrawing(true);
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      const rect = canvasRef.current.getBoundingClientRect();
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      const rect = canvasRef.current.getBoundingClientRect();
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  const handleDrawnSignature = () => {
    if (canvasRef.current) {
      const signatureData = canvasToBase64(canvasRef.current);
      onSign(signatureData, 'drawn');
    }
  };

  const handleTypedSignature = () => {
    const signatureData = createTypedSignature(typedName);
    onSign(signatureData, 'typed');
  };

  const handleUploadedSignature = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        setUploadedImage(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadedSignatureSubmit = () => {
    if (uploadedImage) {
      onSign(uploadedImage, 'uploaded');
    }
  };

  return (
    <Card className="w-full max-w-2xl p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Sign Document</h2>
        <p className="text-gray-600 mt-2">
          {signerName} {signerTitle && `(${signerTitle})`}
        </p>
      </div>

      <Tabs defaultValue="drawn" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="drawn">Draw</TabsTrigger>
          <TabsTrigger value="typed">Type</TabsTrigger>
          <TabsTrigger value="uploaded">Upload</TabsTrigger>
        </TabsList>

        {/* Drawn Signature */}
        <TabsContent value="drawn" className="space-y-4">
          <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
            <canvas
              ref={canvasRef}
              width={500}
              height={200}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="w-full cursor-crosshair"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={clearCanvas}
              className="flex-1"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
            <Button
              onClick={handleDrawnSignature}
              className="flex-1 bg-green-700 hover:bg-green-800"
            >
              <Save className="w-4 h-4 mr-2" />
              Sign with Drawing
            </Button>
          </div>
        </TabsContent>

        {/* Typed Signature */}
        <TabsContent value="typed" className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Signature Text
            </label>
            <input
              type="text"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder="Enter your name as signature"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="border-2 border-gray-300 rounded-lg p-8 bg-white text-center">
            <div style={{ fontFamily: 'cursive', fontSize: '32px', color: '#000' }}>
              {typedName}
            </div>
            <div className="mt-4 border-t border-gray-400 pt-2 text-sm text-gray-600">
              {new Date().toLocaleDateString()}
            </div>
          </div>
          <Button
            onClick={handleTypedSignature}
            className="w-full bg-green-700 hover:bg-green-800"
          >
            <Save className="w-4 h-4 mr-2" />
            Sign with Typed Name
          </Button>
        </TabsContent>

        {/* Uploaded Signature */}
        <TabsContent value="uploaded" className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Upload Signature Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleUploadedSignature}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          {uploadedImage && (
            <div className="border-2 border-gray-300 rounded-lg p-4 bg-white">
              <img src={uploadedImage} alt="Uploaded signature" className="max-h-32 mx-auto" />
            </div>
          )}
          <Button
            onClick={handleUploadedSignatureSubmit}
            disabled={!uploadedImage}
            className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            Sign with Uploaded Image
          </Button>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex gap-2">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </Card>
  );
};
