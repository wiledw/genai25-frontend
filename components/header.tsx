import { User } from '@supabase/supabase-js'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import LoginButton from "@/components/LoginLogoutButton"

interface HeaderProps {
  user: User
}

export function Header({ user }: HeaderProps) {
  // Extract first letter of email for avatar fallback
  const avatarFallback = user.email?.[0].toUpperCase() || 'U'
  
  // Extract name or email username
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
  
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">PancrAI</h1>
            <p className="text-muted-foreground">Early Pancreatic Cancer Detection System</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback>{avatarFallback}</AvatarFallback>
              </Avatar>
              <div className="text-right">
                <p className="font-medium">Welcome, Dr. {displayName}</p>
              </div>
            </div>
            <LoginButton />
          </div>
        </div>
      </div>
    </header>
  )
} 