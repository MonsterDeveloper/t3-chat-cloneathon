import { ArrowUp, Paperclip, Square } from "lucide-react"

import type { useChat } from "@ai-sdk/react"
import {
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  useState,
} from "react"
import React from "react"
import { Button, ToolTipButton } from "~/components/ui/button"
import { useFetcherWithReset } from "~/hooks/use-fetcher-with-reset"
import { useFileUpload } from "~/hooks/use-file-upload"
import type { action } from "~/routes/api/attachments"
import { type Model, ModelPopover } from "../model-popover"
import { Textarea } from "../ui/textarea"
import { FilePreview } from "./file-preview"

// https://openrouter.ai/models
const models = [
  {
    label: "GPT-4o-mini",
    value: "openai/gpt-4o-mini",
    provider: "openai",
    category: "favorites",
    premium: false,
    capabilities: ["vision", "web", "docs"],
  },
  {
    value: "google/gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    provider: "google",
    category: "favorites",
    premium: false,
    capabilities: ["vision", "web", "docs"],
  },
  {
    value: "openai/gpt-imagegen",
    label: "GPT ImageGen",
    provider: "openai",
    category: "favorites",
    capabilities: ["vision", "image"],
    premium: true,
  },
  {
    value: "anthropic/claude-4-sonnet",
    label: "Claude 4 Sonnet",
    provider: "anthropic",
    category: "favorites",
    capabilities: ["vision", "docs"],
    premium: true,
  },
  {
    value: "anthropic/claude-4-sonnet-reasoning",
    label: "Claude 4 Sonnet (Reasoning)",
    provider: "anthropic",
    category: "favorites",
    capabilities: ["vision", "docs", "reasoning"],
    premium: true,
  },
  {
    value: "deepseek/deepseek-r1",
    label: "DeepSeek R1 (Llama Distilled)",
    provider: "deepseek",
    category: "favorites",
    capabilities: ["reasoning"],
    premium: false,
  },
  {
    value: "google/gemini-2.0-flash",
    label: "Gemini 2.0 Flash",
    provider: "google",
    category: "others",
    capabilities: ["vision", "web", "docs"],
    premium: false,
  },
  {
    value: "google/gemini-2.5-flash-preview-05-20",
    label: "Gemini 2.0 Flash Lite",
    provider: "google",
    category: "others",
    capabilities: ["vision", "docs"],
    premium: true,
  },
  {
    value: "google/gemini-2.5-flash-thinking",
    label: "Gemini 2.5 Flash (Thinking)",
    provider: "google",
    category: "others",
    capabilities: ["vision", "web", "docs"],
    premium: false,
  },
  {
    value: "openai/gpt-4o-mini",
    label: "GPT 4o-mini",
    provider: "openai",
    category: "others",
    capabilities: ["vision"],
    premium: true,
  },
  {
    value: "openai/gpt-4o",
    label: "GPT 4o",
    provider: "openai",
    category: "others",
    capabilities: ["vision"],
    premium: true,
  },
  {
    value: "openai/o3-mini",
    label: "o3 mini",
    category: "others",
    capabilities: [],
    provider: "openai",
    premium: true,
  },
  {
    value: "openai/o3",
    label: "o3",
    provider: "openai",
    category: "others",
    capabilities: [],
    premium: false,
  },
] satisfies Model[]

export const ChatInputBox = ({
  value,
  onChange,
  onSubmit,
  status,
  stop,
}: {
  value: string
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void
  onSubmit: ReturnType<typeof useChat>["handleSubmit"]
  status: ReturnType<typeof useChat>["status"]
  stop: () => void
}) => {
  const [model, setModel] = useState<Model>(models[0])
  const attachmentsFetcher = useFetcherWithReset<typeof action>()
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{
      id: string
      contentType: string
      name: string
      url: string
    }>
  >([])

  // Use the better file upload hook
  const [
    { files: localFiles, errors: fileErrors },
    { removeFile, getInputProps, clearFiles },
  ] = useFileUpload({
    accept: "image/svg+xml,image/png,image/jpeg,image/jpg,image/gif,text/*",
    maxSize: 5 * 1024 * 1024,
    multiple: true,
    maxFiles: 10,
    onFilesAdded: (addedFiles) => {
      // Collect files to upload in batch

      const formData = new FormData()
      for (const fileWithPreview of addedFiles) {
        if (fileWithPreview.file instanceof File) {
          formData.append("file", fileWithPreview.file)
        }
      }

      if (formData.has("file")) {
        attachmentsFetcher.submit(formData, {
          method: "post",
          encType: "multipart/form-data",
          action: "/api/attachments",
        })
      }
    },
  })

  const handleRemoveFile = (id: string) => {
    removeFile(id)
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id))
  }

  // Handle successful upload response
  React.useEffect(() => {
    if (attachmentsFetcher.data?.attachments) {
      const newUploadedFiles = attachmentsFetcher.data.attachments.map(
        (attachment: { id: string; contentType: string }) => ({
          id: attachment.id,
          contentType: attachment.contentType,
          name:
            localFiles.find(
              (f) =>
                f.file instanceof File &&
                f.file.type === attachment.contentType,
            )?.file.name || "Unknown",
          url: attachment.id,
        }),
      )

      setUploadedFiles((prev) => [...prev, ...newUploadedFiles])
    }
  }, [attachmentsFetcher.data, localFiles])

  const clearAllFiles = () => {
    clearFiles()
    setUploadedFiles([])
  }

  const submit: typeof onSubmit = (event) => {
    // Create attachments array with proper URLs

    onSubmit(event, {
      data: { model: model.value },
      experimental_attachments: uploadedFiles.map(({ url, contentType }) => ({
        url,
        contentType,
      })),
    })

    attachmentsFetcher.reset()
    clearAllFiles()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      if (model) {
        const formEvent = new Event("submit", {
          cancelable: true,
        }) as unknown as FormEvent<HTMLFormElement>
        submit(formEvent)
      }
    }
  }

  const isUploading = attachmentsFetcher.state === "submitting"

  return (
    <div className="pointer-events-none fixed right-0 bottom-0 left-0 z-10 w-full px-2 md:absolute md:px-4">
      <div className="relative mx-auto flex w-full max-w-full flex-col text-center sm:max-w-3xl">
        <div className="pointer-events-auto w-full rounded-t-xl bg-accent backdrop-blur-3xl">
          <form
            className="relative flex w-full flex-col items-stretch gap-2 rounded-t-xl border border-b-0 bg-background px-3 pt-3 pb-6 text-secondary-foreground outline-8 dark:border-[hsl(0,0%,83%)]/[0.04] dark:bg-secondary/[0.045] dark:outline-chat-background/40"
            style={{
              boxShadow:
                "rgba(0, 0, 0, 0.1) 0px 80px 50px 0px, rgba(0, 0, 0, 0.07) 0px 50px 30px 0px, rgba(0, 0, 0, 0.06) 0px 30px 15px 0px, rgba(0, 0, 0, 0.04) 0px 15px 8px, rgba(0, 0, 0, 0.04) 0px 6px 4px, rgba(0, 0, 0, 0.02) 0px 2px 2px",
            }}
            onSubmit={submit}
          >
            <div className="flex w-full flex-grow flex-col">
              <Textarea
                value={value}
                onChange={onChange}
                onKeyDown={handleKeyDown}
                className="max-h-44 border-none shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-secondary/[0.045] "
                placeholder="Type your message here..."
              />

              {/* Show file previews using the better technique */}
              {localFiles.length > 0 && (
                <FilePreview
                  files={localFiles.map((file) => ({
                    ...file,
                    isLocal: true,
                    displayUrl: file.preview || "",
                  }))}
                  onRemove={handleRemoveFile}
                  isUploading={isUploading}
                />
              )}

              {/* Show file errors */}
              {fileErrors.length > 0 && (
                <div className="mt-2 text-destructive text-xs">
                  {fileErrors[0]}
                </div>
              )}

              <div className="-mb-px mt-2 flex w-full flex-wrap justify-between">
                <div className="flex flex-col gap-2 pr-2 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-1">
                    <ModelPopover
                      models={models}
                      value={model?.value ?? ""}
                      onValueChange={(value) => {
                        setModel(models.find((model) => model.value === value)!)
                      }}
                    />
                    <ToolTipButton
                      // @ts-expect-error weird bug in react types: Element is not assignable to ReactNode
                      content={
                        <>
                          <p>Add an attachment.</p>
                          <p>Accepts: Text, PNG, JPEG, GIF, WebP, HEIC</p>
                        </>
                      }
                    >
                      <div>
                        <input
                          {...getInputProps({
                            multiple: true,
                            type: "file",
                            className: "sr-only",
                            "aria-label": "Upload file",
                          })}
                        />
                        <Button
                          type="button"
                          variant="chatAction"
                          className="gap-1"
                          size="xs"
                          onClick={(event) => {
                            event.preventDefault()
                            event.stopPropagation()
                            // The hook handles opening the file dialog
                            const input = document.querySelector(
                              'input[type="file"]',
                            ) as HTMLInputElement
                            input?.click()
                          }}
                        >
                          <Paperclip className="size-4" />
                          Attach
                        </Button>
                      </div>
                    </ToolTipButton>
                  </div>
                </div>
                <div
                  className="flex items-center justify-center gap-2"
                  aria-label="Message actions"
                >
                  {status === "streaming" || status === "submitted" ? (
                    <Button type="button" className="size-9" onClick={stop}>
                      <Square className="!size-5 fill-current" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      aria-label="Message requires text"
                      disabled={value.length === 0 || isUploading}
                      className="size-9"
                    >
                      <ArrowUp className="!size-5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
