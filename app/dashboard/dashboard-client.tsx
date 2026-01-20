// app/dashboard/dashboard-client.tsx
"use client";

import { MCPTool } from "@/lib/mcp-store";
import { ToolCard } from "@/components/tool-card";
import { SearchBar } from "@/components/search-bar";
import { useState } from "react";

interface DashboardClientProps {
  initialTools: MCPTool[];
}

export function DashboardClient({ initialTools }: DashboardClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTools = initialTools.filter((tool) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = tool.name.toLowerCase().includes(query);
    const descMatch = (tool.description || "").toLowerCase().includes(query);
    return nameMatch || descMatch;
  });

  return (
    <>
      <div className="mb-6 flex justify-end">
        <SearchBar onSearch={setSearchQuery} />
      </div>

      {filteredTools.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-lg border border-dashed">
          <p className="text-muted-foreground">No tools found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          {filteredTools.map((tool) => (
            <div key={tool.name} className="h-full">
              <ToolCard tool={tool} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
