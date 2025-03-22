"use client"

import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle2, HelpCircle } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

type DiagnosisData = {
  hasCancer: boolean
  confidence: number
  stage?: number
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

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Diagnosis Results</CardTitle>
        <CardDescription>AI-assisted analysis of patient data and imaging</CardDescription>
      </CardHeader>
      <CardContent>
        {showPlaceholder ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center">
            <HelpCircle className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No diagnosis yet</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-md">
              Complete the patient information form and submit to generate a diagnosis.
            </p>
          </div>
        ) : diagnosisData ? (
          <div className="space-y-6">
            <Alert variant={diagnosisData.hasCancer ? "destructive" : "default"}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>
                {diagnosisData.hasCancer
                  ? "Potential pancreatic cancer detected"
                  : "No signs of pancreatic cancer detected"}
              </AlertTitle>
              <AlertDescription>
                {diagnosisData.hasCancer
                  ? "Further examination and tests are recommended."
                  : "Patient appears to be healthy based on provided data."}
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Confidence Level</span>
                <span className="text-sm font-medium">{diagnosisData.confidence}%</span>
              </div>
              <Progress value={diagnosisData.confidence} className="h-2" />
            </div>

            {diagnosisData.hasCancer && diagnosisData.stage && (
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-medium">Estimated Stage: {diagnosisData.stage}</h3>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {[1, 2, 3, 4].map((stage) => (
                    <div
                      key={stage}
                      className={`p-2 text-center rounded-md ${
                        stage === diagnosisData.stage ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      {stage}
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-medium">Findings</h3>
                  <div className="grid gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Imaging Analysis</h4>
                      <p className="text-sm text-muted-foreground">
                        The {diagnosisData.stage <= 2 ? "early" : "advanced"} stage pancreatic lesion shows{" "}
                        {diagnosisData.stage <= 2 ? "minimal" : "significant"} involvement of surrounding tissues.{" "}
                        {diagnosisData.stage >= 3 ? "Potential metastasis detected." : ""}
                      </p>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">Risk Assessment</h4>
                      <p className="text-sm text-muted-foreground">
                        Based on patient demographics and clinical data, this represents a
                        {diagnosisData.stage <= 2 ? " moderate " : " high "}
                        risk case requiring {diagnosisData.stage <= 2 ? "prompt" : "immediate"} attention.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Recommended Next Steps</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Consult with oncology specialist</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Schedule follow-up {diagnosisData.stage <= 2 ? "within 2 weeks" : "immediately"}</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Consider {diagnosisData.stage <= 2 ? "biopsy" : "comprehensive staging workup"}</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Disclaimer</h4>
              <p className="text-xs text-muted-foreground">
                This is an AI-assisted analysis for demonstration purposes only. All diagnoses should be confirmed by
                qualified medical professionals. This tool is not a substitute for professional medical advice,
                diagnosis, or treatment.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[400px] text-center">
            <AlertCircle className="h-16 w-16 text-destructive mb-4" />
            <h3 className="text-lg font-medium">Error processing diagnosis</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-md">
              There was an error processing the diagnosis. Please try again or contact support.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

