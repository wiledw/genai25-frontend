"use client"

import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle2, HelpCircle, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"
import { jsPDF } from "jspdf"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

type DiagnosisData = {
  result: {
    analysis_summary: string;
    image?: string;
    image_type?: string;
  };
  patientId: number;
}

interface ParsedDiagnosis {
  patient_data: string;
  diagnosis: string;
  confidence_score: string;
  patient_explanation: string;
}

export function DiagnosisResults() {
  const [diagnosisData, setDiagnosisData] = useState<DiagnosisData | null>(null)
  const [showPlaceholder, setShowPlaceholder] = useState(true)

  useEffect(() => {
    const handleDiagnosisReady = (event: CustomEvent<DiagnosisData>) => {
      setDiagnosisData(event.detail)
      setShowPlaceholder(false)
    }

    window.addEventListener("diagnosisReady", handleDiagnosisReady as EventListener)

    return () => {
      window.removeEventListener("diagnosisReady", handleDiagnosisReady as EventListener)
    }
  }, [])

  const parseAnalysisSummary = (summary: string): ParsedDiagnosis | null => {
    try {
      // Extract JSON string from the markdown code block
      const jsonStr = summary.split('```json\n')[1].split('\n```')[0];
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Error parsing analysis summary:', error);
      return null;
    }
  };

  const formatPatientData = (data: string): string => {
    const details = data
      .replace('Patient is a ', '')
      .replace('.0-year-old', ' years old')
      .replace('obese: 1.0', 'is obese')
      .replace('obese: 0.0', 'is not obese')
      .replace('smoker: Yes', 'is a smoker')
      .replace('smoker: No', 'is not a smoker')
      .replace('has diabetes: Yes', 'has diabetes')
      .replace('has diabetes: No', 'does not have diabetes')
      .replace('healthcare access: Low', 'low healthcare access')
      .replace('healthcare access: Medium', 'medium healthcare access')
      .replace('healthcare access: High', 'high healthcare access')
      .replace('physical activity: Low', 'low physcial activity level')
      .replace('physical activity: Medium', 'medium physical activity level')
      .replace('physical activity: High', 'high physical activity level')
      .replace('smoker: Yes', 'is a smoker')
      .replace('smoker: No', 'is not a smoker')
      .replace('Drinks alcohol: Yes', 'drinks alcohol')
      .replace('Drinks alcohol: No', 'does not drink alcohol')
      .toLowerCase();

    // Capitalize first letter
    return details.charAt(0).toUpperCase() + details.slice(1) + '.';
  };

  const extractRiskLevel = (diagnosis: string): string => {
    return diagnosis.toLowerCase().includes('higher risk') ? 'HIGH' : 'LOW';
  };

  const handleDownload = async () => {
    const base64Data = diagnosisData?.result?.image;
    const imageType = diagnosisData?.result?.image_type;
    const patientId = diagnosisData?.patientId;
    
    if (base64Data && imageType) {
      try {
        // Create new PDF document
        const doc = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4"
        });

        // Add title and patient ID
        doc.setFontSize(20);
        doc.text("Scan Analysis Report", 20, 20);
        
        doc.setFontSize(14);
        doc.text(`Patient ID: ${patientId}`, 20, 35);

        // Add image
        const imgWidth = 170; // Width in mm (A4 width is 210mm)
        const imgHeight = 120; // Height in mm
        doc.addImage(
          `data:${imageType};base64,${base64Data}`,
          "PNG",
          20, // x position
          45, // y position
          imgWidth,
          imgHeight
        );

        // Add analysis text
        doc.setFontSize(12);
        doc.setTextColor(153, 102, 0); // Brown/yellow color for emphasis
        doc.text("Image Analysis:", 20, 180);
        doc.setTextColor(0, 0, 0); // Reset to black
        doc.text("Yellow highlighted areas indicate potential cancerous regions", 20, 190);

        // Save the PDF
        doc.save(`patient-${patientId}-scan-analysis.pdf`);
      } catch (error) {
        console.error('Error generating PDF:', error);
        toast.error("Failed to generate PDF. Please try again.");
      }
    }
  };

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Diagnosis Results</CardTitle>
        <CardDescription>AI-assisted analysis of patient data</CardDescription>
      </CardHeader>
      <CardContent>
        {showPlaceholder ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center">
            <HelpCircle className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No diagnosis yet</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-md">
              Complete the patient information form to generate a diagnosis.
            </p>
          </div>
        ) : diagnosisData ? (
          <div className="space-y-6">
            {(() => {
              const parsedData = parseAnalysisSummary(diagnosisData.result.analysis_summary);
              if (!parsedData) return null;

              const riskLevel = extractRiskLevel(parsedData.diagnosis);
              const patientSummary = formatPatientData(parsedData.patient_data);

              return (
                <>
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4">Patient ID: {diagnosisData.patientId}</h3>

                    {diagnosisData?.result?.image ? (
                      <div className="bg-muted p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-lg font-medium">Scan Analysis</h4>
                          <Button 
                            onClick={handleDownload}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <Download className="h-4 w-4" />
                            Download PDF Report
                          </Button>
                        </div>
                        <div className="flex justify-center">
                          <img 
                            src={`data:${diagnosisData.result.image_type};base64,${diagnosisData.result.image}`}
                            alt="Scan Analysis"
                            className="max-w-full h-auto rounded-lg shadow-lg"
                          />
                        </div>
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                          <p className="text-sm text-yellow-800">
                            <span className="font-medium">Image Analysis:</span> Yellow highlighted areas indicate potential cancerous regions
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-md leading-relaxed mb-4">
                          {patientSummary}
                        </p>
                        
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Risk Assessment:</span>
                          <span className={`px-3 py-1 rounded-full font-semibold ${
                            riskLevel === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {riskLevel} RISK
                          </span>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg mt-6">
                          <h4 className="text-lg font-medium mb-2">Patient Summary</h4>
                          <p className="text-sm leading-relaxed">
                            {parsedData.patient_explanation}
                          </p>
                        </div>

                        <div className="border p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-medium">Analysis Confidence</h4>
                            <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded">
                              {(parseFloat(parsedData.confidence_score) * 100).toFixed(0)}%
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            This score indicates the reliability of our analysis based on the provided data.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[400px] text-center">
            <AlertCircle className="h-16 w-16 text-destructive mb-4" />
            <h3 className="text-lg font-medium">Error processing diagnosis</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-md">
              There was an error processing the diagnosis. Please try again.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

