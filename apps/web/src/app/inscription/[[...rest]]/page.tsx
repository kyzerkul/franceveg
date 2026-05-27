import type { Metadata } from 'next'
import { SignUp } from '@clerk/nextjs'

export const metadata: Metadata = {
  title: 'Inscription | France Veg',
  robots: { index: false, follow: false },
}

export default function InscriptionPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Créer un compte</h1>
          <p className="text-gray-500 text-sm mt-1">Rejoignez la communauté France Veg</p>
        </div>
        <SignUp fallbackRedirectUrl="/dashboard" signInUrl="/connexion" />
      </div>
    </main>
  )
}
