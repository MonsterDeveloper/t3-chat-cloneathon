import { Check, ChevronDown } from "lucide-react";
import * as React from "react";

import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";

export interface Model {
  id: string;
  value: string;
  label: string;
  provider: "meta" | "openai" | "anthropic" | "google";
}

export function ModelPopover({
  models,
  onModelChange,
}: {
  models: Model[];
  onModelChange: (model: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          // biome-ignore lint/a11y/useSemanticElements: <explanation>
          role="combobox"
          variant="outline"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? models.find((model) => model.id === value)?.label
            : "Select model..."}
          <ChevronDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search model..." className="h-9" />
          <CommandList>
            <CommandEmpty>No model found.</CommandEmpty>
            <CommandGroup>
              {models.map((model) => (
                <CommandItem
                  key={model.id}
                  value={model.id}
                  onSelect={(currentValue) => {
                    onModelChange(currentValue === value ? "" : currentValue);
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  {model.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === model.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
