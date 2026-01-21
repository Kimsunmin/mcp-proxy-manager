export interface MCPTool {
    name: string;
    description?: string;
    inputSchema?: Record<string, any>;
    [key: string]: any;
    version?: string;
}

export interface MCPServerConfig {
    baseUrl: string;
    ssePath: string;
    messagePath: string;
}

class MCPStore {
    private overrides: Map<string, Partial<MCPTool>> = new Map();
    private config: MCPServerConfig = {
        baseUrl: process.env.NEXT_PUBLIC_MCP_BASE_URL || "http://localhost:8080",
        ssePath: process.env.NEXT_PUBLIC_MCP_SSE_PATH || "/sse",
        messagePath: process.env.NEXT_PUBLIC_MCP_MESSAGE_PATH || "/mcp/message",
    };

    getConfig() {
        return this.config;
    }

    setConfig(config: { baseUrl: string; ssePath: string; messagePath: string }) {
        this.config = { ...config };
        console.log(`[MCPStore] MCP 서버 설정 변경:`, this.config);
    }

    getOverride(toolName: string): Partial<MCPTool> | undefined {
        return this.overrides.get(toolName);
    }

    setOverride(toolName: string, data: Partial<MCPTool>): void {
        const existing = this.overrides.get(toolName) || {};
        this.overrides.set(toolName, { ...existing, ...data });
        console.log(`[MCPStore] Updated override for tool: ${toolName}`);
    }

    getAllOverrides(): Record<string, Partial<MCPTool>> {
        return Object.fromEntries(this.overrides);
    }

    removeOverride(toolName: string): void {
        this.overrides.delete(toolName);
        console.log(`[MCPStore] Removed override for tool: ${toolName}`);
    }
}

const globalKey = Symbol.for("mcp-store");
const globalForMCP = globalThis as unknown as { [globalKey]: MCPStore };

export const mcpStore = globalForMCP[globalKey] || new MCPStore();

if (process.env.NODE_ENV !== "production") {
    globalForMCP[globalKey] = mcpStore;
}