import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { PatientForm } from "@/components/patient-form"
import { DiagnosisResults } from "@/components/diagnosis-result"
import { Header } from "@/components/header"

export default async function Home() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header user={data.user} />
      
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="grid gap-8 md:grid-cols-2">
          <PatientForm />
          <DiagnosisResults />
        </div>
      </main>

      <footer className="bg-white border-t mt-auto py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} PancrAI - For demonstration purposes only</p>
          <p className="mt-2">This tool is intended for medical professionals as a diagnostic aid.</p>
        </div>
      </footer>
    </div>
  );
}

