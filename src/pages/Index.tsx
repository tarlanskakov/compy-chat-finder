import { useEffect, useMemo, useState } from "react";
import SearchForm from "@/components/compsearch/SearchForm";
import CompanyResultCard, { CompanyResult } from "@/components/compsearch/CompanyResultCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { toast } = useToast();
  const [hasKey, setHasKey] = useState<boolean>(() => !!localStorage.getItem("openai_api_key"));
  const [keyInput, setKeyInput] = useState("");

  const { mutate, data, isPending } = useMutation({
    mutationFn: async (query: string) => {
      const apiKey = localStorage.getItem("openai_api_key");
      if (!apiKey) throw new Error("Missing OpenAI API key");
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.2,
          messages: [
            { role: "system", content: "You are a precise financial research assistant. Respond ONLY with a JSON object matching the provided schema and no extra text." },
            { role: "user", content: `Company to research: ${query}. Return JSON with keys: company_name, ticker, exchange, description, website, country, sector, industry, market_cap, revenue, ebitda, pe_ratio, price, source_links (array of URLs), raw_markdown (short markdown summary).` },
          ],
        }),
      });
      if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
      const json = await res.json();
      const content: string = json?.choices?.[0]?.message?.content ?? "";
      let parsed: CompanyResult | null = null;
      try {
        parsed = JSON.parse(content);
      } catch {
        const match = content.match(/{[\s\S]*}/);
        if (match) {
          try {
            parsed = JSON.parse(match[0]);
          } catch {}
        }
      }
      if (!parsed) throw new Error("Failed to parse AI response");
      return { result: parsed };
    },
    onError: (err: any) => {
      console.error(err);
      if (String(err?.message || err).includes("OpenAI")) {
        toast({ title: "OpenAI error", description: "Please verify your API key and try again." });
      } else if (String(err?.message || err).includes("Missing OpenAI API key")) {
        toast({ title: "Missing API key", description: "Add your OpenAI API key below to search." });
      } else {
        toast({ title: "Search failed", description: "Please try again in a moment." });
      }
    },
  });

  const handleSearch = (q: string) => mutate(q);

  useEffect(() => {
    document.title = "CompSearch — AI Company Lookup";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", "Search companies and get AI-generated profiles with ticker, financials, and insights.");

    // canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", window.location.origin + "/");

    // JSON-LD: WebSite with SearchAction
    const ld = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "CompSearch",
      url: window.location.origin + "/",
      potentialAction: {
        "@type": "SearchAction",
        target: `${window.location.origin}/?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    };
    const scriptId = "ld-website";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(ld);
  }, []);

  const result = data?.result;

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/60">
      <section className="container py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">CompSearch</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Enter a company name to get an AI-generated summary with ticker and key financials.
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-3xl">
          <SearchForm onSearch={handleSearch} loading={isPending} />
        </div>
        {!hasKey && (
          <div className="mx-auto mt-4 max-w-3xl">
            <div className="rounded-lg border bg-card/70 p-4">
              <h3 className="text-sm font-semibold">Connect OpenAI</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter your OpenAI API key to enable AI-generated results. Stored locally in your browser.
              </p>
              <div className="mt-3 flex gap-2">
                <Input
                  type="password"
                  placeholder="sk-..."
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  aria-label="OpenAI API key"
                />
                <Button
                  onClick={() => {
                    const v = keyInput.trim();
                    if (!v) {
                      toast({ title: "Enter a valid key" });
                      return;
                    }
                    localStorage.setItem("openai_api_key", v);
                    setHasKey(true);
                    setKeyInput("");
                    toast({ title: "API key saved" });
                  }}
                >
                  Save Key
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="mx-auto mt-8 max-w-3xl">
          {isPending ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-20 w-full" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </div>
          ) : result ? (
            <CompanyResultCard result={result} />
          ) : (
            <div className="text-center text-sm text-muted-foreground">
              Results will appear here.
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Index;
