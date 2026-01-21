import { mcpStore, MCPTool } from "@/lib/mcp-store";
import { Client } from "@modelcontextprotocol/sdk/client";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    // MCPStore의 전역 설정값만 사용
    const config = mcpStore.getConfig();
    const mcpUrl = `${config.baseUrl}${config.ssePath}`;
    if (!mcpUrl || !mcpUrl.startsWith("http")) {
        return new NextResponse(JSON.stringify({ error: "Invalid or missing MCP server URL" }), { status: 400 });
    }

    // 1. SDK 클라이언트 및 전송 수단 초기화
    const transport = new SSEClientTransport(new URL(mcpUrl));
    const client = new Client(
        {
            name: "mcp-proxy-route",
            version: "1.0.0"
        },
        {
            capabilities: {}
        }
    );

    const tools: MCPTool[] = [];
    try {
        // 2. 서버 연결 (Handshake & Session ID 자동 처리)
        await client.connect(transport);
        console.log("[Dashboard] SDK Connection established.");

        // 3. 툴 목록 요청
        const result = await client.listTools();
        console.log(`[Dashboard] Retrieved ${result.tools.length} tools.`);

        const originalTools = result.tools as MCPTool[];

        // 4. 오버라이드 데이터 병합
        const overriddenTools = originalTools.map((tool) => {
            const override = mcpStore.getOverride(tool.name);
            return {
                ...tool,
                ...override,
                _isOverridden: !!override,
                _originalDescription: tool.description,
            };
        });

        return new NextResponse(JSON.stringify(overriddenTools), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("[Dashboard] SDK Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}