// app/dashboard/page.tsx
import { MCPTool } from "@/lib/mcp-store";
import { getTools } from "./actions";
import { DashboardClient } from "./dashboard-client";

export const dynamic = "force-dynamic"; // 항상 최신 데이터 로드

export default async function DashboardPage() {
    const tools: MCPTool[] = [];

    try {
        const fetchedTools = await getTools();
        tools.push(...fetchedTools);
    } catch (error) {
        console.error("[DashboardPage] Error fetching tools:", error);
    }

    return (
        <div className="h-screen overflow-y-auto bg-background no-scrollbar">
            {/* Header */}
            <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
                <div className="container mx-auto py-4 px-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">MCP Proxy Manager</h1>
                        <p className="text-sm text-muted-foreground">
                            Live Tool Metadata & Prompt Engineering Dashboard
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                            Online
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto py-8 px-4">
               <DashboardClient initialTools={tools} />
            </main>
        </div>
    );
}
