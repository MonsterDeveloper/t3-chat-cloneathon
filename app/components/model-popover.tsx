"use client"

import type React from "react"

import {
  Brain,
  ChevronDown,
  ChevronUp,
  FileText,
  Globe,
  Image,
  Info,
  PinIcon,
  Search,
  Sparkles,
} from "lucide-react"
import { useRef, useState } from "react"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { cn } from "~/lib/utils"

export interface Model {
  value: string
  label: string
  premium: boolean
  category: "favorites" | "others"
  provider: "meta" | "openai" | "anthropic" | "google" | "deepseek"
  capabilities: ("web" | "docs" | "vision" | "reasoning" | "image")[]
}

const capabilities = {
  fast: { icon: Sparkles, label: "fast" },
  vision: { icon: Search, label: "vision" },
  web: { icon: Globe, label: "web" },
  docs: { icon: FileText, label: "docs" },
  reasoning: { icon: Brain, label: "reasoning" },
  image: { icon: Image, label: "image" },
  "effort-control": { icon: Info, label: "effort-control" },
  search: { icon: Search, label: "search" },
  pdf: { icon: FileText, label: "pdf" },
} as const

type Capability = keyof typeof capabilities

const CapabilityIcon = ({ capability }: { capability: Capability }) => {
  const Icon = capabilities[capability].icon

  const colorMap: Record<Capability, string> = {
    fast: "bg-green-100 text-green-600",
    vision: "bg-green-100 text-green-600",
    web: "bg-blue-100 text-blue-600",
    docs: "bg-purple-100 text-purple-600",
    reasoning: "bg-orange-100 text-orange-600",
    image: "bg-pink-100 text-pink-600",
    "effort-control": "bg-gray-100 text-gray-600",
    search: "bg-gray-100 text-gray-600",
    pdf: "bg-gray-100 text-gray-600",
  }

  return (
    <div
      className={`rounded-lg p-1.5 ${colorMap[capability] || "bg-gray-100 text-gray-600"}`}
    >
      <Icon className="size-4" />
    </div>
  )
}

const ModelIcon = ({
  provider,
  view,
}: {
  provider: string
  view: "favorites-list" | "cards"
}) => {
  return (
    <div>
      {provider === "openai" ? (
        <svg
          className={cn("size-8", {
            "size-4": view === "favorites-list",
          })}
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid"
          viewBox="0 0 256 260"
        >
          <title>OpenAI Icon</title>
          <path d="M239.184 106.203a64.716 64.716 0 0 0-5.576-53.103C219.452 28.459 191 15.784 163.213 21.74A65.586 65.586 0 0 0 52.096 45.22a64.716 64.716 0 0 0-43.23 31.36c-14.31 24.602-11.061 55.634 8.033 76.74a64.665 64.665 0 0 0 5.525 53.102c14.174 24.65 42.644 37.324 70.446 31.36a64.72 64.72 0 0 0 48.754 21.744c28.481.025 53.714-18.361 62.414-45.481a64.767 64.767 0 0 0 43.229-31.36c14.137-24.558 10.875-55.423-8.083-76.483Zm-97.56 136.338a48.397 48.397 0 0 1-31.105-11.255l1.535-.87 51.67-29.825a8.595 8.595 0 0 0 4.247-7.367v-72.85l21.845 12.636c.218.111.37.32.409.563v60.367c-.056 26.818-21.783 48.545-48.601 48.601Zm-104.466-44.61a48.345 48.345 0 0 1-5.781-32.589l1.534.921 51.722 29.826a8.339 8.339 0 0 0 8.441 0l63.181-36.425v25.221a.87.87 0 0 1-.358.665l-52.335 30.184c-23.257 13.398-52.97 5.431-66.404-17.803ZM23.549 85.38a48.499 48.499 0 0 1 25.58-21.333v61.39a8.288 8.288 0 0 0 4.195 7.316l62.874 36.272-21.845 12.636a.819.819 0 0 1-.767 0L41.353 151.53c-23.211-13.454-31.171-43.144-17.804-66.405v.256Zm179.466 41.695-63.08-36.63L161.73 77.86a.819.819 0 0 1 .768 0l52.233 30.184a48.6 48.6 0 0 1-7.316 87.635v-61.391a8.544 8.544 0 0 0-4.4-7.213Zm21.742-32.69-1.535-.922-51.619-30.081a8.39 8.39 0 0 0-8.492 0L99.98 99.808V74.587a.716.716 0 0 1 .307-.665l52.233-30.133a48.652 48.652 0 0 1 72.236 50.391v.205ZM88.061 139.097l-21.845-12.585a.87.87 0 0 1-.41-.614V65.685a48.652 48.652 0 0 1 79.757-37.346l-1.535.87-51.67 29.825a8.595 8.595 0 0 0-4.246 7.367l-.051 72.697Zm11.868-25.58 28.138-16.217 28.188 16.218v32.434l-28.086 16.218-28.188-16.218-.052-32.434Z" />
        </svg>
      ) : provider === "anthropic" ? (
        <svg
          fill="#000"
          fillRule="evenodd"
          className={cn("size-8", {
            "size-4": view === "favorites-list",
          })}
          viewBox="0 0 24 24"
          width="1em"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Anthropic Icon</title>
          <path d="M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-7.258 0h3.767L16.906 20h-3.674l-1.343-3.461H5.017l-1.344 3.46H0L6.57 3.522zm4.132 9.959L8.453 7.687 6.205 13.48H10.7z" />
        </svg>
      ) : provider === "google" ? (
        <svg
          height="1em"
          className={cn("size-8", {
            "size-4": view === "favorites-list",
          })}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Gemini Icon</title>
          <defs>
            <linearGradient
              id="lobe-icons-gemini-fill"
              x1="0%"
              x2="68.73%"
              y1="100%"
              y2="30.395%"
            >
              <stop offset="0%" stopColor="#1C7DFF" />
              <stop offset="52.021%" stopColor="#1C69FF" />
              <stop offset="100%" stopColor="#F0DCD6" />
            </linearGradient>
          </defs>
          <path
            d="M12 24A14.304 14.304 0 000 12 14.304 14.304 0 0012 0a14.305 14.305 0 0012 12 14.305 14.305 0 00-12 12"
            fill="url(#lobe-icons-gemini-fill)"
            fillRule="nonzero"
          />
        </svg>
      ) : provider === "deepseek" ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <title>Deepseek Icon</title>
          <path
            fill="#4D6BFE"
            d="M23.748 4.482c-.254-.124-.364.113-.512.234-.051.039-.094.09-.137.136-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.156-.708-.311-.955-.65-.172-.241-.219-.51-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.093.172.187.129.323-.082.28-.18.552-.266.833-.055.179-.137.217-.329.14a5.526 5.526 0 0 1-1.736-1.18c-.857-.828-1.631-1.742-2.597-2.458a11.365 11.365 0 0 0-.689-.471c-.985-.957.13-1.743.388-1.836.27-.098.093-.432-.779-.428-.872.004-1.67.295-2.687.684a3.055 3.055 0 0 1-.465.137 9.597 9.597 0 0 0-2.883-.102c-1.885.21-3.39 1.102-4.497 2.623C.082 8.606-.231 10.684.152 12.85c.403 2.284 1.569 4.175 3.36 5.653 1.858 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.133-.284 4.994-1.86.47.234.962.327 1.78.397.63.059 1.236-.03 1.705-.128.735-.156.684-.837.419-.961-2.155-1.004-1.682-.595-2.113-.926 1.096-1.296 2.746-2.642 3.392-7.003.05-.347.007-.565 0-.845-.004-.17.035-.237.23-.256a4.173 4.173 0 0 0 1.545-.475c1.396-.763 1.96-2.015 2.093-3.517.02-.23-.004-.467-.247-.588zM11.581 18c-2.089-1.642-3.102-2.183-3.52-2.16-.392.024-.321.471-.235.763.09.288.207.486.371.739.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.167-1.361-.802-2.5-1.86-3.301-3.307-.774-1.393-1.224-2.887-1.298-4.482-.02-.386.093-.522.477-.592a4.696 4.696 0 0 1 1.529-.039c2.132.312 3.946 1.265 5.468 2.774.868.86 1.525 1.887 2.202 2.891.72 1.066 1.494 2.082 2.48 2.914.348.292.625.514.891.677-.802.09-2.14.11-3.054-.614zm1-6.44a.306.306 0 0 1 .415-.287.302.302 0 0 1 .2.288.306.306 0 0 1-.31.307.303.303 0 0 1-.304-.308zm3.11 1.596c-.2.081-.399.151-.59.16a1.245 1.245 0 0 1-.798-.254c-.274-.23-.47-.358-.552-.758a1.73 1.73 0 0 1 .016-.588c.07-.327-.008-.537-.239-.727-.187-.156-.426-.199-.688-.199a.559.559 0 0 1-.254-.078.253.253 0 0 1-.114-.358c.028-.054.16-.186.192-.21.356-.202.767-.136 1.146.016.352.144.618.408 1.001.782.391.451.462.576.685.914.176.265.336.537.445.848.067.195-.019.354-.25.452z"
          />
        </svg>
      ) : null}
    </div>
  )
}

const ModelCard = ({
  model,
  onSelect,
  view,
}: {
  view: "favorites-list" | "cards"
  model: Model
  onSelect: (model: Model) => void
}) => {
  return (
    <Card
      className="relative flex w-32 cursor-pointer flex-col items-center justify-center p-1 shadow-none transition-shadow"
      onClick={() => onSelect(model)}
    >
      {model.premium && (
        <div className="absolute top-3 right-3">
          <Sparkles className="size-4 text-pink-500" />
        </div>
      )}
      <CardContent className="p-0">
        <div className="flex flex-col items-center space-y-3 text-center">
          <div className="font-bold text-2xl text-purple-900">
            <ModelIcon provider={model.provider} view={view} />
          </div>
          <div>
            <h3 className="line-clamp-1 font-semibold text-gray-900 text-sm">
              {model.label}
            </h3>
          </div>
          <div className="flex flex-wrap justify-center gap-1">
            {model.capabilities.map((capability) => (
              <CapabilityIcon key={capability} capability={capability} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const ModelListItem = ({
  model,
  view,
  onSelect,
}: {
  model: Model
  view: "favorites-list" | "cards"
  onSelect: (model: Model) => void
}) => {
  return (
    <div
      className="group flex items-center justify-between rounded-lg px-1 py-3 **:select-none hover:bg-accent/20"
      onKeyDown={() => onSelect(model)}
    >
      <div className="flex items-center space-x-3">
        <div className="font-bold text-purple-900">
          <ModelIcon provider={model.provider} view={view} />
        </div>
        <div className="flex items-center space-x-2">
          <span className="font-medium text-gray-900 text-sm">
            {model.label}
          </span>
          {model.premium && <Sparkles className="size-4 text-pink-500" />}
          <Info className="size-4 text-gray-400" />
        </div>
      </div>
      <div className="flex gap-1">
        {model.capabilities.map((capability) => (
          <CapabilityIcon key={capability} capability={capability} />
        ))}
      </div>
    </div>
  )
}

export function ModelPopover({
  models,
  value,
  onValueChange,
}: {
  models: Model[]
  value: string
  onValueChange: (model: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [view, setView] = useState<"favorites-list" | "cards">("favorites-list")

  const filteredModels = models.filter((model) =>
    model.label.toLowerCase().includes(searchQuery.toLowerCase()),
  )
  const favoriteModels = filteredModels.filter(
    (model) => model.category === "favorites",
  )
  const otherModels = filteredModels.filter(
    (model) => model.category === "others",
  )

  const handleModelSelect = (model: Model) => {
    onValueChange(model.value)
    setSearchQuery("")
    setView("favorites-list")
    setIsOpen(false)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    if (value.length > 0) {
      setView("cards")
    }
  }

  const handleBackToFavorites = () => {
    setView("favorites-list")
    setSearchQuery("")
  }

  const handleShowAllClick = () => {
    setView("cards")
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto w-fit justify-between text-left font-medium"
        >
          {value
            ? models.find((model) => model.value === value)?.label
            : "Select model..."}
          <ChevronDown className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "max-h-[80vh] w-[450px] overflow-y-auto p-0 pb-8 transition-all duration-75",
          {
            "w-[600px]": view === "cards",
          },
        )}
        align="start"
      >
        <div className="space-y-4 overflow-hidden px-4 py-2">
          <div className="relative">
            <Search className="-translate-y-1/2 -left-0.5 absolute top-1/2 size-5 transform text-primary" />
            <Input
              ref={inputRef}
              value={searchQuery}
              placeholder="Search models..."
              onChange={handleSearchChange}
              className="rounded-none border-0 border-pink-200 border-b pl-6 shadow-none focus:border-pink-400 focus:ring-pink-400 focus-visible:ring-0"
            />
          </div>

          {view === "cards" ? (
            <div className="space-y-6">
              {favoriteModels.length > 0 && (
                <div>
                  <div className="mb-4 flex items-center space-x-2">
                    <PinIcon className="size-5 text-gray-600" />
                    <h2 className="text-gray-900 text-sm">Favorites</h2>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {favoriteModels.map((model) => (
                      <ModelCard
                        key={model.value}
                        model={model}
                        view={view}
                        onSelect={handleModelSelect}
                      />
                    ))}
                  </div>
                </div>
              )}
              {otherModels.length > 0 && (
                <div>
                  <h2 className="mb-4 text-gray-900 text-sm">Others</h2>
                  <div className="flex flex-wrap gap-4">
                    {otherModels.map((model) => (
                      <ModelCard
                        key={model.value}
                        model={model}
                        view={view}
                        onSelect={handleModelSelect}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {favoriteModels.map((model) => (
                <ModelListItem
                  key={model.value}
                  model={model}
                  view={view}
                  onSelect={handleModelSelect}
                />
              ))}
            </div>
          )}

          {view === "cards" &&
            favoriteModels.length === 0 &&
            otherModels.length === 0 && (
              <div className="flex h-40 items-center justify-center">
                <p className="text-gray-500">No models found</p>
              </div>
            )}
        </div>
        <div className="-bottom-4 absolute left-0 z-50 w-full rounded-b-md border bg-white p-1">
          <Button
            variant="ghost"
            onClick={
              view === "cards" ? handleBackToFavorites : handleShowAllClick
            }
            className="flex items-center gap-1 text-gray-600 hover:text-gray-700"
          >
            <ChevronUp
              className={cn("mr-2 size-4 transition-all duration-100 ease-in", {
                "-rotate-90": view === "cards",
              })}
            />
            {view === "cards" ? "Favorites" : "Show all"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
