
import { AnalysisDashboard } from "@/components/analysis/AnalysisDashboard";

export default function AnalysisPage() {
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <header className="mb-6">
            <h1 className="text-3xl font-bold font-headline">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Get insights into your sales and product performance.</p>
        </header>
        <AnalysisDashboard />
    </div>
  );
}
