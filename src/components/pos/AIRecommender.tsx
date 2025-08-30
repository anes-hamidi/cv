"use client";

import { useEffect, useState, useTransition } from "react";
import { Lightbulb, PlusCircle, Loader2 } from "lucide-react";
import { suggestRelatedProducts } from "@/ai/flows/suggest-related-products";
import type { SuggestRelatedProductsOutput } from "@/ai/flows/suggest-related-products";
import { usePOS } from "@/context/POSContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";

export function AIRecommender() {
  const { cart, sales, products, addToCart } = usePOS();
  const [suggestion, setSuggestion] = useState<SuggestRelatedProductsOutput | null>(null);
  const [isPending, startTransition] = useTransition();
  const { state: sidebarState } = useSidebar();


  useEffect(() => {
    const handler = setTimeout(() => {
      if (cart.length > 0) {
        startTransition(async () => {
          try {
            const pastPurchases = sales.flatMap((s) => s.items.map((i) => i.name));
            const uniquePastPurchases = [...new Set(pastPurchases)];

            const result = await suggestRelatedProducts({
              currentItems: cart.map((item) => item.name),
              pastPurchaseData: JSON.stringify(uniquePastPurchases),
            });
            setSuggestion(result);
          } catch (error) {
            console.error("AI suggestion failed:", error);
            setSuggestion(null);
          }
        });
      } else {
        setSuggestion(null);
      }
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [cart, sales]);

  const handleAddSuggestion = () => {
    if (suggestion?.suggestion) {
      const productToAdd = products.find(p => p.name.toLowerCase() === suggestion.suggestion.toLowerCase());
      if (productToAdd) {
        addToCart(productToAdd);
      }
    }
  };

  if (!cart.length) return null;

  return (
    <div className={cn("rounded-lg border bg-card text-card-foreground", sidebarState === "collapsed" && "hidden")}>
      <div className="p-4">
        <div className="flex items-center">
          <Lightbulb className="h-5 w-5 mr-3 text-accent" />
          <h3 className="font-semibold font-headline text-accent text-lg">Suggestion</h3>
        </div>
      </div>
      <div className="p-4 pt-0">
        {isPending ? (
          <div className="flex items-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </div>
        ) : suggestion?.suggestion ? (
          <div>
            <p className="font-semibold">{suggestion.suggestion}</p>
            <p className="text-sm text-muted-foreground mb-3">{suggestion.reason}</p>
            <Button size="sm" variant="outline" onClick={handleAddSuggestion} className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No suggestions right now.</p>
        )}
      </div>
    </div>
  );
}
