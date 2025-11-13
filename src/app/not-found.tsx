import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="text-5xl font-semibold tracking-tight">404</div>
        <p className="text-muted-foreground">Sorry, we couldn’t find that page.</p>
        <Link
          href="/"
          className="inline-block px-4 py-2 border rounded-none hover:bg-muted transition-colors"
        >
          Go back home
        </Link>
      </div>
    </div>
  )
}


