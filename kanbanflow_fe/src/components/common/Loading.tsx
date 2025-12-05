import { Loader2 } from "lucide-react"

interface LoadingProps {
  size?: number
  fullScreen?: boolean
  tip?: string
}

export default function Loading({ fullScreen = false, tip }: LoadingProps) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        {tip && <p className="mt-4 text-lg font-medium text-muted-foreground animate-pulse">{tip}</p>}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      {tip && <p className="mt-2 text-sm text-muted-foreground">{tip}</p>}
    </div>
  )
}