// app/dashboard/dashboard-client.tsx
"use client";

import { ToolCard } from "@/components/tool-card";
import { SearchBar } from "@/components/search-bar";
import { useState } from "react";
import { useTools } from "./useTools";

export function DashboardClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const { tools, loading, error, refresh } = useTools();

  const filteredTools = tools.filter((tool) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = tool.name.toLowerCase().includes(query);
    const descMatch = (tool.description || "").toLowerCase().includes(query);
    return nameMatch || descMatch;
  });

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <SearchBar onSearch={setSearchQuery} />
        <div className="flex items-center gap-2">
           <button
            onClick={refresh}
            className="px-3 py-1 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors"
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {loading && tools.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-lg border border-dashed">
          <p className="text-muted-foreground">Loading tools...</p>
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-muted/30 rounded-lg border border-dashed">
          <p className="text-red-500 mb-2">{error}</p>
          <button onClick={refresh} className="underline text-sm">Try Again</button>
        </div>
      ) : filteredTools.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-lg border border-dashed">
          <p className="text-muted-foreground">No tools found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          {filteredTools.map((tool) => (
            <div key={tool.name} className="h-full">
              <ToolCard tool={tool} onRefresh={refresh} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
