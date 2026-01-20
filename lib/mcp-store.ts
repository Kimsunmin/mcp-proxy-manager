export interface MCPTool {
    name: string;
    description?: string;
    inputSchema?: Record<string, any>;
    [key: string]: any;
    version?: string;
}

class MCPStore {
    private overrides: Map<string, Partial<MCPTool>> = new Map();

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