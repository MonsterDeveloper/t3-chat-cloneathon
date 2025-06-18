import {
  Copy,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Share2,
  X,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"

type DisplayFile = {
  id: string
  file: { name: string; type: string; size?: number }
  preview?: string
  displayUrl: string
  isLocal?: boolean
}

type FilePreviewDialogProps = {
  isOpen: boolean
  onClose: () => void
  file: DisplayFile | null
}

const FilePreviewDialog = ({
  isOpen,
  onClose,
  file,
}: FilePreviewDialogProps) => {
  const [isSharing, setIsSharing] = useState(false)
  const [textContent, setTextContent] = useState<string>("")
  const [isLoadingText, setIsLoadingText] = useState(false)

  const isImage = file?.file.type.startsWith("image/")
  const isText =
    file?.file.type.startsWith("text/") ||
    file?.file.type === "application/json" ||
    file?.file.type === "application/javascript"

  // Load text content when dialog opens for text files
  useState(() => {
    if (isOpen && file && isText && !textContent) {
      setIsLoadingText(true)
      fetch(file.displayUrl)
        .then((response) => response.text())
        .then((content) => {
          setTextContent(content)
          setIsLoadingText(false)
        })
        .catch(() => {
          toast.error("Failed to load file content")
          setIsLoadingText(false)
        })
    }
  })

  const handleCopyLink = async () => {
    if (!file) {
      return
    }

    try {
      await navigator.clipboard.writeText(file.displayUrl)
      toast.success("File link copied to clipboard")
    } catch {
      toast.error("Failed to copy link")
    }
  }

  const handleDownload = async () => {
    if (!file) {
      return
    }

    try {
      const response = await fetch(file.displayUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = file.file.name
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success("File downloaded successfully")
    } catch {
      toast.error("Failed to download file")
    }
  }

  const handleShare = async () => {
    if (!file) {
      return
    }

    setIsSharing(true)
    try {
      if (navigator.share) {
        await navigator.share({
          title: file.file.name,
          text: `Check out this file: ${file.file.name}`,
          url: file.displayUrl,
        })
        toast.success("File shared successfully")
      } else {
        await handleCopyLink()
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        toast.error("Failed to share file")
      }
    } finally {
      setIsSharing(false)
    }
  }

  const openInNewTab = () => {
    if (!file) {
      return
    }
    window.open(file.displayUrl, "_blank")
  }

  if (!file) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-5" />
            <span>{file.file.name}</span>
            {file.file.size && (
              <span className="font-normal text-muted-foreground text-sm">
                ({(file.file.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* File Content Preview */}
          <div className="flex justify-center">
            {isImage ? (
              <img
                src={file.displayUrl}
                alt={file.file.name}
                className="max-h-[60vh] max-w-full rounded-lg border object-contain"
              />
            ) : isText ? (
              <div className="max-h-[60vh] w-full overflow-auto">
                {isLoadingText ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="size-6 animate-spin" />
                    <span className="ml-2">Loading file content...</span>
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap rounded-lg border bg-muted p-4 text-sm">
                    {textContent}
                  </pre>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center p-8 text-muted-foreground">
                <FileText className="size-12" />
                <p className="ml-2">Preview not available for this file type</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="gap-2"
            >
              <Copy className="size-4" />
              Copy Link
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="gap-2"
            >
              <Download className="size-4" />
              Download
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={openInNewTab}
              className="gap-2"
            >
              <ExternalLink className="size-4" />
              Open in New Tab
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={handleShare}
              disabled={isSharing}
              className="gap-2"
            >
              <Share2 className="size-4" />
              {isSharing ? "Sharing..." : "Share"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
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
  const [selectedFile, setSelectedFile] = useState<DisplayFile | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleFileClick = (fileWithPreview: DisplayFile) => {
    setSelectedFile(fileWithPreview)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedFile(null)
  }

  return (
    <>
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
                <button
                  type="button"
                  className="cursor-pointer border-0 bg-transparent p-0 transition-opacity hover:opacity-80"
                  onClick={() => handleFileClick(fileWithPreview)}
                  disabled={isUploading}
                >
                  <img
                    src={fileWithPreview.displayUrl}
                    alt={file.name}
                    className="max-h-12 rounded-lg border-4 border-primary/20"
                  />
                </button>
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
              <button
                key={fileWithPreview.id}
                type="button"
                className="relative flex cursor-pointer items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 transition-colors hover:bg-primary/10"
                onClick={() => handleFileClick(fileWithPreview)}
                disabled={isUploading}
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
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemove(fileWithPreview.id)
                  }}
                  disabled={isUploading}
                >
                  <X className="size-3" />
                </button>
              </button>
            )
          }

          return null
        })}
      </div>

      <FilePreviewDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        file={selectedFile}
      />
    </>
  )
}
