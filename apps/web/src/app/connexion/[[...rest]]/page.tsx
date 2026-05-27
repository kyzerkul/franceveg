import type { Metadata } from 'next'
import { SignIn } from '@clerk/nextjs'

export const metadata: Metadata = {
  title: 'Connexion | France Veg',
  robots: { index: false, follow: false },
}

export default function ConnexionPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Connexion</h1>
          <p className="text-gray-500 text-sm mt-1">Accédez à votre espace France Veg</p>
        </div>
        <SignIn fallbackRedirectUrl="/dashboard" signUpUrl="/inscription" />
      </div>
    </main>
  )
}
