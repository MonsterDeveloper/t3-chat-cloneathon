import { FileText, Loader2, X } from "lucide-react"

type DisplayFile = {
  id: string
  file: { name: string; type: string; size?: number }
  preview?: string
  displayUrl: string
  isLocal?: boolean
}

export const FilePreview = ({
  files,
  onRemove,
  isUploading = false,
}: {
  files: DisplayFile[]
  onRemove: (id: string) => void
  isUploading?: boolean
}) => {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      {files.map((fileWithPreview) => {
        const file = fileWithPreview.file
        const isImage = file.type.startsWith("image/")
        const isText =
          file.type.startsWith("text/") ||
          file.type === "application/json" ||
          file.type === "application/javascript"

        if (isImage) {
          return (
            <div key={fileWithPreview.id} className="relative">
              <img
                src={fileWithPreview.displayUrl}
                alt={file.name}
                className="max-h-12 rounded-lg border-4 border-primary/20"
              />
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/30">
                  <Loader2 className="size-4 animate-spin text-white" />
                </div>
              )}
              <button
                type="button"
                className="-right-2 -top-2 absolute flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white hover:bg-destructive/90 disabled:opacity-50"
                onClick={() => onRemove(fileWithPreview.id)}
                disabled={isUploading}
              >
                <X className="size-3" />
              </button>
            </div>
          )
        }

        if (isText) {
          return (
            <div
              key={fileWithPreview.id}
              className="relative flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2"
            >
              <FileText className="size-4 text-primary" />
              <span className="text-foreground text-sm">{file.name}</span>
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/30">
                  <Loader2 className="size-4 animate-spin text-white" />
                </div>
              )}
              <button
                type="button"
                className="-right-2 -top-2 absolute flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white hover:bg-destructive/90 disabled:opacity-50"
                onClick={() => onRemove(fileWithPreview.id)}
                disabled={isUploading}
              >
                <X className="size-3" />
              </button>
            </div>
          )
        }

        return null
      })}
    </div>
  )
}
