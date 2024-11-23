import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, Upload, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { extractTextFromPDF, downloadTextFile } from '@/utils/pdfUtils';

export function PDFExtractor() {
  const [extractedText, setExtractedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!file.type.includes('pdf')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a PDF file"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const text = await extractTextFromPDF(file);
      setExtractedText(text);
      toast({
        title: "Success!",
        description: "Text extracted successfully"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error processing PDF",
        description: "Failed to extract text from the PDF"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  const handleDownload = () => {
    if (!extractedText) return;
    downloadTextFile(extractedText, 'extracted-text.txt');
    toast({
      title: "Downloaded!",
      description: "Text file has been downloaded"
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="p-6">
        <h1 className="text-3xl font-bold text-center mb-8">PDF Text Extractor</h1>
        
        <div 
          {...getRootProps()} 
          className={`dropzone ${isDragActive ? 'dropzone-active' : 'border-gray-300'} 
            cursor-pointer mb-6 text-center`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            <Upload className="w-12 h-12 text-primary" />
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <p>Processing PDF...</p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-medium">
                  {isDragActive ? 'Drop your PDF here' : 'Drag & drop your PDF here'}
                </p>
                <p className="text-sm text-muted-foreground">or click to select a file</p>
              </div>
            )}
          </div>
        </div>

        {extractedText && (
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-muted/30 max-h-[400px] overflow-y-auto">
              <pre className="whitespace-pre-wrap font-mono text-sm">
                {extractedText}
              </pre>
            </div>
            
            <Button
              onClick={handleDownload}
              className="w-full"
              size="lg"
            >
              <Download className="w-4 h-4 mr-2" />
              Download as Text File
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}