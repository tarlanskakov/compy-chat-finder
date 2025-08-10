import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface CompanyResult {
  company_name: string;
  ticker?: string;
  exchange?: string;
  description?: string;
  website?: string;
  country?: string;
  sector?: string;
  industry?: string;
  market_cap?: string;
  revenue?: string;
  ebitda?: string;
  pe_ratio?: string;
  price?: string;
  source_links?: string[];
  raw_markdown?: string;
}

const Stat = ({ label, value }: { label: string; value?: string }) => (
  <div className="rounded-md border bg-background/60 p-3">
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className="text-sm font-medium">{value ?? "—"}</div>
  </div>
);

const CompanyResultCard = ({ result }: { result: CompanyResult }) => {
  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="text-2xl">
          {result.company_name}
          {result.ticker ? <span className="ml-2 text-base text-muted-foreground">({result.ticker}{result.exchange ? ` · ${result.exchange}` : ""})</span> : null}
        </CardTitle>
        {result.description ? (
          <CardDescription>{result.description}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-6">
        <section>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            <Stat label="Price" value={result.price} />
            <Stat label="P/E Ratio" value={result.pe_ratio} />
            <Stat label="Market Cap" value={result.market_cap} />
            <Stat label="Revenue" value={result.revenue} />
            <Stat label="EBITDA" value={result.ebitda} />
            <Stat label="Sector" value={result.sector} />
            <Stat label="Industry" value={result.industry} />
            <Stat label="Country" value={result.country} />
            {result.website ? (
              <Stat label="Website" value={result.website} />
            ) : null}
          </div>
        </section>
        {result.source_links && result.source_links.length > 0 ? (
          <section>
            <h3 className="mb-2 text-sm font-semibold">Sources</h3>
            <ul className="list-inside list-disc text-sm text-muted-foreground">
              {result.source_links.map((url, i) => (
                <li key={i}>
                  <a className="text-primary underline-offset-4 hover:underline" href={url} target="_blank" rel="noreferrer noopener">
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default CompanyResultCard;
