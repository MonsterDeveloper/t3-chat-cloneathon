import { Check, Copy, Edit, GitMergeIcon, RefreshCcw } from "lucide-react"
import { useState } from "react"
import Markdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { materialLight } from "react-syntax-highlighter/dist/esm/styles/prism"
import remarkGfm from "remark-gfm"
import { cn } from "~/lib/utils"
import { Button, ToolTipButton } from "../ui/button"

interface MessageProps {
  content: string
  role: string
  model: string
}

const NEW_LINE_REGEX = /\n$/
const LANGUAGE_REGEX = /language-(\w+)/

export function ChatMessage({ content, role, model }: MessageProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (copied) {
      return
    }
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1000)
  }

  const isUser = role === "user"

  return (
    <div
      className={cn(
        "group relative flex w-full gap-4 p-2 **:text-md",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "flex w-full flex-col gap-2 ",
          isUser ? "items-end" : "items-start",
        )}
      >
        <div
          className={cn(
            "relative flex w-fit flex-col gap-4 break-words rounded-lg text-sm",
            {
              "bg-muted px-3 py-2": isUser,
            },
          )}
        >
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, className, children, ...props }) {
                const match = LANGUAGE_REGEX.exec(className || "")
                const language = match ? match[1] : ""

                return match ? (
                  <div className="group/code relative flex flex-col gap-2">
                    {/* Language label */}
                    <div className="flex h-10 items-center justify-between rounded-t-lg border-b bg-secondary/80 px-3 py-2 text-primary text-xs">
                      <span className="font-medium">{language}</span>
                      <Button
                      variant="ghost"
                        onClick={() =>
                          navigator.clipboard.writeText(String(children))
                        }
                        className="rounded p-0.5 transition-opacity "
                      >
                        <Copy className="size-4" />
                      </Button>
                    </div>
                    <SyntaxHighlighter
                      //@ts-expect-error TODO: fix types
                      style={materialLight}
                      language={language}
                      PreTag="div"
                      className="!mt-0 !rounded-t-none py-4"
                      customStyle={{
                        margin: 0,
                        borderTopLeftRadius: 0,
                        borderTopRightRadius: 0,
                        wordBreak: "break-word",
                        whiteSpace: "pre-wrap",
                        overflowWrap: "break-word",
                      }}
                      {...props}
                    >
                      {String(children).replace(NEW_LINE_REGEX, "")}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <code
                    className={cn(
                      "rounded bg-gray-100 px-1 py-0.5 text-sm dark:bg-gray-800",
                      className,
                    )}
                    {...props}
                  >
                    {children}
                  </code>
                )
              },
            }}
          >
            {content}
          </Markdown>
        </div>

        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {isUser ? (
            <>
              <ToolTipButton
                side="bottom"
                align="center"
                content="Copy message"
              >
                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
                  <RefreshCcw className="mr-1 size-4" />
                </Button>
              </ToolTipButton>
              <ToolTipButton
                side="bottom"
                align="center"
                content="Edit message"
              >
                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
                  <Edit className="mr-1 size-4" />
                </Button>
              </ToolTipButton>
              <ToolTipButton
                side="bottom"
                align="center"
                content="Retry message"
              >
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs"
                  onClick={handleCopy}
                >
                  <div className="flex items-center gap-1">
                    {copied ? (
                      <Check className="mr-1 size-4" />
                    ) : (
                      <Copy className="mr-1 size-4" />
                    )}
                  </div>
                </Button>
              </ToolTipButton>
            </>
          ) : (
            <>
              <ToolTipButton
                side="bottom"
                align="center"
                title="Search chats"
                content="Copy message"
              >
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs"
                  onClick={handleCopy}
                >
                  <div className="flex items-center gap-1">
                    {copied ? (
                      <Check className="mr-1 size-4" />
                    ) : (
                      <Copy className="mr-1 size-4" />
                    )}
                  </div>
                </Button>
              </ToolTipButton>
              <ToolTipButton
                side="bottom"
                align="center"
                title="Search chats"
                content="Branch off conversation"
              >
                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
                  <GitMergeIcon className="mr-1 size-4" />
                </Button>
              </ToolTipButton>

              <ToolTipButton
                side="bottom"
                align="center"
                title="Search chats"
                content="Retry conversation"
              >
                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
                  <RefreshCcw className="mr-1 size-4" />
                </Button>
              </ToolTipButton>
              <span className="text-primary/50 text-xs">{model}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
