import { useState, FormEvent, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchFormProps {
  onSearch: (query: string) => void | Promise<void>;
  loading?: boolean;
}

const SearchForm = ({ onSearch, loading }: SearchFormProps) => {
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;
    onSearch(query.trim());
  };

  const handlePointer = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = wrapperRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty("--x", `${x}px`);
    el.style.setProperty("--y", `${y}px`);
  };

  return (
    <div
      ref={wrapperRef}
      onMouseMove={handlePointer}
      className="relative overflow-hidden rounded-xl border bg-card/70 backdrop-blur card-elevated"
    >
      <div className="pointer-events-none absolute inset-0 spotlight" />
      <form onSubmit={handleSubmit} className="relative z-10 p-4 md:p-6">
        <label htmlFor="company" className="sr-only">
          Company name
        </label>
        <div className="flex gap-2">
          <Input
            id="company"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter a company name (e.g., Apple)"
            aria-label="Company name"
            autoComplete="organization"
          />
          <Button type="submit" variant="hero" disabled={loading}>
            <Search className="mr-1" />
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Tip: Try full names (e.g., Alphabet) or well-known brands (e.g., Nike).
        </p>
      </form>
    </div>
  );
};

export default SearchForm;
