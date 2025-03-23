import { GalleryVerticalEnd } from "lucide-react"
import Image from "next/image"
import PancAI from "@/app/images/PancAI.png"
import GoogleButton from "@/components/GoogleButton"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left side - Login Form */}
      <div className="flex flex-col p-8 md:p-12 lg:p-16">
        <div className="flex items-center gap-3 mb-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-8" />
          </div>
          <span className="text-4xl font-bold tracking-tight">PancrAI</span>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Welcome Back</h1>
              <p className="text-muted-foreground">
                Sign in to access your account!
              </p>
            </div>

            <div className="space-y-4">
              <GoogleButton />
              
              <div className="flex items-center">
                <div className="flex-grow h-px bg-muted"></div>
                <span className="px-4 text-sm text-muted-foreground">Secure login for healthcare professionals</span>
                <div className="flex-grow h-px bg-muted"></div>
              </div>

              <div className="text-sm text-muted-foreground">
                By signing in, you agree to our{" "}
                <a href="#" className="underline hover:text-primary">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="underline hover:text-primary">
                  Privacy Policy
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} PancAI. All rights reserved.</p>
          <p>HIPAA Compliant | Secure Medical Platform</p>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="relative hidden lg:block bg-muted">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center p-12">
          <div className="bg-white/90 p-8 rounded-lg backdrop-blur-sm max-w-lg">
            <h2 className="text-2xl font-bold mb-4">
              Advanced Pancreatic Cancer Risk Assessment
            </h2>
            <p className="text-muted-foreground mb-4">
              Leverage AI-powered diagnostics to enhance patient care and improve early detection rates.
              Our platform provides cutting-edge tools for healthcare professionals.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                ✓ AI-Driven Risk Analysis
              </li>
              <li className="flex items-center">
                ✓ HIPAA Compliant Platform
              </li>
              <li className="flex items-center">
                ✓ Real-time Patient Monitoring
              </li>
            </ul>
          </div>
        </div>
        <Image
          src={PancAI}
          alt="Medical Dashboard Preview"
          className="object-cover object-center"
          fill
          priority
          quality={100}
        />
      </div>
    </div>
  )
}
