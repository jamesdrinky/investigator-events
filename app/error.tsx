'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="flex h-screen items-center justify-center flex-col gap-4">
      <h2 className="text-xl font-semibold">Something broke</h2>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Retry
      </button>
    </div>
  )
}