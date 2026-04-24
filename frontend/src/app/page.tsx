import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center min-h-screen bg-surface px-6">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-primary font-display tracking-tight">
            Fair-Ride
          </h1>
          <p className="text-on-surface-variant font-body text-sm">
            Fast, fair, and reliable logistics — built for Nigeria.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Link
            href="/auth/login"
            className="w-full inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary px-6 py-3 text-sm font-semibold font-display shadow-md hover:brightness-110 transition-all"
          >
            Get Started
          </Link>
        </div>
      </div>
    </main>
  )
}
