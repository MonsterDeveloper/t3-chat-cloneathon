import { ArrowUp, Paperclip, Square } from "lucide-react"

import type { useChat } from "@ai-sdk/react"
import type { ChatRequestOptions } from "ai"
import { type ChangeEvent, type FormEvent, useState } from "react"
import { Button } from "~/components/ui/button"
import { type Model, ModelPopover } from "../model-popover"
import { Label } from "../ui/label"

// https://openrouter.ai/models
const models = [
  {
    label: "GPT-4o-mini",
    value: "openai/gpt-4o-mini",
    provider: "openai",
  },
  {
    label: "GPT-4o",
    value: "openai/gpt-4o",
    provider: "openai",
  },
  {
    label: "Claude 3.5 Sonnet",
    value: "anthropic/claude-3.5-sonnet",
    provider: "anthropic",
  },
  {
    label: "Claude 3.7 Sonnet",
    value: "anthropic/claude-3.7-sonnet",
    provider: "anthropic",
  },
  {
    label: "Gemini 2.5 Flash Preview 05-20",
    value: "google/gemini-2.5-flash-preview-05-20",
    provider: "google",
  },
] satisfies Model[]

export function ChatInputBox({
  value,
  onChange,
  onSubmit,
  status,
  stop,
}: {
  value: string
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void
  onSubmit: (
    event: FormEvent<HTMLFormElement>,
    options: ChatRequestOptions,
  ) => void
  status: ReturnType<typeof useChat>["status"]
  stop: () => void
}) {
  const [model, setModel] = useState<Model>(models[0])

  return (
    <div className="pointer-events-none fixed right-0 bottom-0 left-0 z-10 w-full px-2 md:absolute md:px-4">
      <div className="relative mx-auto flex w-full max-w-full flex-col text-center sm:max-w-3xl">
        <div className="pointer-events-auto w-full">
          <form
            className="relative flex w-full flex-col items-stretch gap-2 rounded-t-xl border border-b-0 bg-background px-3 pt-3 pb-6 text-secondary-foreground outline-8 dark:border-[hsl(0,0%,83%)]/[0.04] dark:bg-secondary/[0.045] dark:outline-chat-background/40"
            style={{
              boxShadow:
                "rgba(0, 0, 0, 0.1) 0px 80px 50px 0px, rgba(0, 0, 0, 0.07) 0px 50px 30px 0px, rgba(0, 0, 0, 0.06) 0px 30px 15px 0px, rgba(0, 0, 0, 0.04) 0px 15px 8px, rgba(0, 0, 0, 0.04) 0px 6px 4px, rgba(0, 0, 0, 0.02) 0px 2px 2px",
            }}
            onSubmit={(event) => {
              onSubmit(event, {
                data: {
                  model: model.value,
                },
              })
            }}
          >
            <div className="flex w-full flex-grow flex-col">
              <div className="flex flex-grow flex-row items-start">
                <textarea
                  name="input"
                  id="chat-input"
                  placeholder="Type your message here..."
                  className="h-12 max-h-[200px] min-h-12 w-full resize-none overflow-y-auto bg-transparent text-base text-foreground leading-6 outline-none placeholder:text-secondary-foreground/60 disabled:opacity-0"
                  aria-label="Message input"
                  aria-describedby="chat-input-description"
                  autoComplete="off"
                  value={value}
                  onChange={onChange}
                />
                <div id="chat-input-description" className="sr-only">
                  Press Enter to send, Shift + Enter for new line
                </div>
              </div>
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
                    <Label className="flex items-center">
                      <input type="file" className="hidden" />
                      <input multiple className="sr-only" type="file" />
                      <div className="flex items-center gap-1">
                        <Paperclip className="size-4" />
                        <span className="max-sm:hidden sm:ml-0.5">Attach</span>
                      </div>
                    </Label>
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
                      disabled={value.length === 0}
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
