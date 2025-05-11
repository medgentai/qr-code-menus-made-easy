import React from 'react';
import QRCode from 'react-qr-code';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Printer, Share2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface QrCodeDisplayProps {
  value: string;
  size?: number;
  title?: string;
  description?: string;
  isActive?: boolean;
  scanCount?: number;
  showActions?: boolean;
}

const QrCodeDisplay: React.FC<QrCodeDisplayProps> = ({
  value,
  size = 200,
  title,
  description,
  isActive = true,
  scanCount = 0,
  showActions = true,
}) => {
  const downloadQrCode = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = size + 40; // Add padding
      canvas.height = size + 40 + (title ? 60 : 0); // Add space for title if needed
      
      if (ctx) {
        // Fill background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw QR code
        ctx.drawImage(img, 20, 20, size, size);
        
        // Add title if provided
        if (title) {
          ctx.font = 'bold 16px Arial';
          ctx.fillStyle = 'black';
          ctx.textAlign = 'center';
          ctx.fillText(title, canvas.width / 2, size + 40);
          
          if (description) {
            ctx.font = '12px Arial';
            ctx.fillText(description, canvas.width / 2, size + 60);
          }
        }
        
        // Create download link
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `qrcode-${title || 'download'}.png`;
        link.href = dataUrl;
        link.click();
      }
    };
    
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  const printQrCode = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code - ${title || 'ScanServe'}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              font-family: Arial, sans-serif;
            }
            .qr-container {
              text-align: center;
              padding: 20px;
              border: 1px solid #eee;
              border-radius: 8px;
              background: white;
            }
            h2 {
              margin-top: 20px;
              margin-bottom: 5px;
            }
            p {
              margin-top: 5px;
              color: #666;
            }
            @media print {
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <img src="data:image/svg+xml;base64,${btoa(svgData)}" width="${size}" height="${size}" />
            ${title ? `<h2>${title}</h2>` : ''}
            ${description ? `<p>${description}</p>` : ''}
          </div>
          <div class="no-print" style="margin-top: 20px;">
            <button onclick="window.print()">Print</button>
            <button onclick="window.close()">Close</button>
          </div>
          <script>
            setTimeout(() => window.print(), 500);
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col items-center">
          {isActive !== undefined && (
            <div className="w-full flex justify-end mb-2">
              <Badge variant={isActive ? "success" : "destructive"}>
                {isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          )}
          
          <div className="bg-white p-4 rounded-lg">
            <QRCode
              id="qr-code-svg"
              value={value}
              size={size}
              level="H"
              className="h-auto max-w-full"
            />
          </div>
          
          {title && (
            <h3 className="text-lg font-medium mt-4 text-center">{title}</h3>
          )}
          
          {description && (
            <p className="text-sm text-muted-foreground mt-1 text-center">{description}</p>
          )}
          
          {scanCount !== undefined && (
            <div className="mt-2 text-sm text-muted-foreground">
              Scanned {scanCount} {scanCount === 1 ? 'time' : 'times'}
            </div>
          )}
          
          {showActions && (
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={downloadQrCode}>
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={printQrCode}>
                <Printer className="h-4 w-4 mr-1" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(value)}>
                <Share2 className="h-4 w-4 mr-1" />
                Copy Link
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QrCodeDisplay;
