"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToastContainer, toast } from 'react-toastify'; // Import toast components
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
import dayjs from 'dayjs'

const patientFormSchema = z.object({
  patientId: z.coerce.number().int().min(0).optional(),
  age: z.coerce.number().int().min(1).max(120).optional(),
  gender: z.enum(["Male", "Female"]).optional(),
  height: z.coerce.number().min(1).max(250).optional(),
  weight: z.coerce.number().min(1).max(300).optional(),
  scanType: z.enum(["CT", "MRI", "PET"]).optional(),
  scanDate: z.date().optional(),
  resectionStatus: z.enum(["primary", "R0", "R+"]).optional(),
  smoking: z.enum(["Yes", "No"]).optional(),
  diabetes: z.enum(["Yes", "No"]).optional(),
  alcohol: z.enum(["Yes", "No"]).optional(),
  activity: z.enum(["Low", "Medium", "High"]).optional(),
  healthcare: z.enum(["Low", "Medium", "High"]).optional(),
})

type PatientFormValues = z.infer<typeof patientFormSchema>

const defaultValues: Partial<PatientFormValues> = {
  patientId: 0,
  age: 0,
  gender: undefined,
  height: 0,
  weight: 0,
  scanType: undefined,
  scanDate: undefined,
  resectionStatus: undefined,
  smoking: undefined,
  diabetes: undefined,
  activity: undefined,
  healthcare: undefined,
  alcohol: undefined,
}

export function PatientForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues,
  })

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.name.endsWith('.nii')) {
        setSelectedFile(file)
      } else {
        toast.error("Please upload a valid NIfTI (.nii) file")
      }
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
  }

  async function onSubmit(data: PatientFormValues) {
    setIsSubmitting(true)

    // Calculate BMI and determine obesity
    const calculateBMI = (height: number, weight: number) => {
      const heightInMeters = height / 100; // Convert cm to meters
      return weight / (heightInMeters * heightInMeters);
    };

    // Create new data object with obesity status
    const bmi = calculateBMI(data.height!, data.weight!);
    const dataWithObesity = {
      ...data,
      obesity: bmi >= 30 ? "1" : "0" // WHO definition of obesity: BMI ≥ 30
    };

    // Remove height and weight from the data sent to API
    delete dataWithObesity.height;
    delete dataWithObesity.weight;

    const demographicsFilled = dataWithObesity.age !== undefined && 
      dataWithObesity.gender !== undefined && 
      dataWithObesity.obesity !== undefined &&
      dataWithObesity.smoking !== undefined && 
      dataWithObesity.diabetes !== undefined && 
      dataWithObesity.activity !== undefined && 
      dataWithObesity.alcohol !== undefined &&
      dataWithObesity.patientId !== undefined &&
      dataWithObesity.healthcare !== undefined;
    const imagingFilled = dataWithObesity.scanType !== undefined && 
      dataWithObesity.scanDate !== undefined && 
      dataWithObesity.resectionStatus !== undefined;

    if ((demographicsFilled && !imagingFilled) || (imagingFilled && !demographicsFilled)) {
      try {
        const formData = new FormData();

        formData.append('data', JSON.stringify(dataWithObesity));

        if (selectedFile) {
          formData.append('file', selectedFile);
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/combined_analysis`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const result = await response.json();
        
        window.dispatchEvent(new CustomEvent("diagnosisReady", {
          detail: {
            result,
            patientId: data.patientId 
          } 
        }));
        
        setIsSubmitting(false);
      } catch (error) {
        console.error('Error:', error);
        toast.error("Failed to generate diagnosis. Please try again.");
        setIsSubmitting(false);
      }
    } else {
      toast.error("Please fill all fields in either the demographics or imaging section, but not both partially.");
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Patient Information</CardTitle>
        <CardDescription>Enter patient details and imaging information to generate a diagnosis.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col min-h-[500px]">
            <Tabs defaultValue="demographics" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="demographics">Demographics</TabsTrigger>
                <TabsTrigger value="imaging">Imaging Data</TabsTrigger>
              </TabsList>
    
              <TabsContent value="demographics" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Age" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height (cm)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Height" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (kg)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Weight" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="smoking"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Smoking History</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select smoking history" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Yes">Yes</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="diabetes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diabetes</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select diabetes status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Yes">Yes</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="activity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Physical Activity Level</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select activity level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Low">Low</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="High">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="healthcare"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Access to Healthcare</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select access level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Low">Low</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="High">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <FormField
                    control={form.control}
                    name="alcohol"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alcohol Consumption</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Consume alcohol" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Yes">Yes</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="patientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Patient ID</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="ID" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </div>
                
              </TabsContent>

              <TabsContent value="imaging" className="space-y-4 pt-4">
                <div className="border-2 border-dashed rounded-lg p-6">
                  <input
                    type="file"
                    accept=".nii"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  
                  {!selectedFile ? (
                    <label
                      htmlFor="file-upload"
                      className="flex flex-col items-center justify-center cursor-pointer"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Upload medical imaging scans (CT, MRI, or PET)</p>
                      <p className="text-xs text-muted-foreground mt-1">Supported format: NIfTI (.nii)</p>
                    </label>
                  ) : (
                    <div className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex items-center space-x-2">
                        <Upload className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm font-medium">{selectedFile.name}</span>
                      </div>
                      <button
                        onClick={handleRemoveFile}
                        className="p-1 hover:bg-background rounded"
                        type="button"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <Button type="submit" className="w-full mt-auto" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Generate Diagnosis"}
            </Button>
          </form>
        </Form>
      </CardContent>

      <ToastContainer position="top-center" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </Card>
  )
}

