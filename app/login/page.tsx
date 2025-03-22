import { GalleryVerticalEnd } from "lucide-react"
import Image from "next/image"
import PancAI from "@/app/images/PancAI.png"
import GoogleButton from "@/components/GoogleButton"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            PancAI
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <GoogleButton/>
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Image
          src={PancAI}
          alt="Image"
          width={500}
          height={500}
        />
      </div>
    </div>
  )
}
