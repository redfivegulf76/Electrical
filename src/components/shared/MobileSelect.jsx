import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ChevronDown, Check } from "lucide-react";

function useIsMobile() {
  const [mobile, setMobile] = React.useState(
    () => (typeof window !== "undefined" ? window.innerWidth < 768 : false)
  );
  React.useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mobile;
}

/**
 * Responsive Select: shows a shadcn Select popover on desktop,
 * and a bottom Drawer sheet on mobile.
 *
 * Props:
 *   value         - controlled value
 *   onValueChange - callback(newValue)
 *   placeholder   - placeholder / drawer title text
 *   options       - [{ value: string, label: string }]
 *   className     - optional extra class on trigger
 */
export default function MobileSelect({ value, onValueChange, placeholder, options, className }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const selected = options.find((o) => o.value === value);

  if (!isMobile) {
    return (
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ${className || ""}`}
      >
        <span className={selected ? "text-foreground" : "text-muted-foreground"}>
          {selected?.label || placeholder}
        </span>
        <ChevronDown className="w-4 h-4 opacity-50 shrink-0" />
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader className="pb-2">
            <DrawerTitle>{placeholder}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-8 overflow-y-auto max-h-72 space-y-1">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`w-full flex items-center justify-between text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  value === opt.value
                    ? "bg-blue-50 text-blue-700"
                    : "hover:bg-slate-50 text-slate-700"
                }`}
                onClick={() => {
                  onValueChange(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
                {value === opt.value && <Check className="w-4 h-4 shrink-0" />}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}