import type { AIModelChoice } from "@/lib/types";

type AIModelSelectorProps = {
  value: AIModelChoice;
  onChange: (value: AIModelChoice) => void;
  disabled?: boolean;
};

const options: Array<{
  id: AIModelChoice;
  name: string;
  description: string;
}> = [
  {
    id: "nemotron",
    name: "Nemotron",
    description: "Fast civic reasoning"
  },
  {
    id: "gpt-oss",
    name: "GPT OSS",
    description: "Open analysis style"
  }
];

export function AIModelSelector({ value, onChange, disabled = false }: AIModelSelectorProps) {
  const selectedIndex = options.findIndex((option) => option.id === value);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface-elevated)_70%,transparent)] p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">AI engine</p>
          <p className="mt-1 text-sm font-semibold text-[var(--text-secondary)]">Choose how Greenlight writes the explanation.</p>
        </div>
      </div>

      <div className="relative grid grid-cols-2 gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1">
        <span
          className="absolute bottom-1 top-1 rounded-md bg-[color-mix(in_srgb,var(--primary)_16%,var(--surface))] shadow-sm transition-transform duration-300 ease-out"
          style={{
            left: "0.25rem",
            width: "calc(50% - 0.375rem)",
            transform: `translateX(${selectedIndex <= 0 ? 0 : "calc(100% + 0.25rem)"})`
          }}
          aria-hidden="true"
        />
        {options.map((option) => {
          const selected = value === option.id;

          return (
            <button
              key={option.id}
              type="button"
              disabled={disabled}
              className={`relative z-10 rounded-md px-3 py-3 text-left transition ${
                selected ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
              onClick={() => onChange(option.id)}
              aria-pressed={selected}
            >
              <span className="text-sm font-bold">{option.name}</span>
              <span className="mt-1 block text-xs leading-4 text-[var(--text-muted)]">{option.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
