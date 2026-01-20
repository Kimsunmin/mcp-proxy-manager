"use server";

import { mcpStore, MCPTool } from "@/lib/mcp-store";
import { revalidatePath, unstable_noStore } from "next/cache";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

const ORIGINAL_MCP_URL = process.env.ORIGINAL_MCP_URL || "http://localhost:8080/sse";

/**
 * MCP SDK를 사용하여 안전하게 툴 목록을 가져옵니다.
 * SDK가 SSE 연결 관리, 세션 ID 처리, 메시지 전송 등을 자동으로 처리하므로 데드락 위험이 적습니다.
 */
export async function getTools(): Promise<MCPTool[]> {
  console.log(`[Dashboard] Connecting via SDK to: ${ORIGINAL_MCP_URL}`);

  // 1. Transport 및 Client 초기화
  const transport = new SSEClientTransport(new URL(ORIGINAL_MCP_URL));
  const client = new Client(
    {
      name: "mcp-proxy-dashboard",
      version: "1.0.0"
    },
    {
      capabilities: {}
    }
  );

  try {
    // 2. 서버 연결 (Handshake & Session ID 자동 처리)
    await client.connect(transport);
    console.log("[Dashboard] SDK Connection established.");

    // 3. 툴 목록 요청
    const result = await client.listTools();
    console.log(`[Dashboard] Retrieved ${result.tools.length} tools.`);

    const originalTools = result.tools as MCPTool[];

    // 4. 오버라이드 데이터 병합
    return originalTools.map((tool) => {
      const override = mcpStore.getOverride(tool.name);
      return {
        ...tool,
        ...override,
        _isOverridden: !!override,
        _originalDescription: tool.description,
      };
    });

  } catch (error) {
    console.error("[Dashboard] SDK Error:", error);
    return [];
  }
}

/**
 * 사용자가 수정한 툴 정보를 저장합니다.
 */
export async function saveToolOverride(toolName: string, description: string) {
  mcpStore.setOverride(toolName, { description });
  revalidatePath("/dashboard"); // 화면 갱신
  return { success: true };
}

/**
 * 수정한 내용을 초기화(삭제)합니다.
 */
export async function resetToolOverride(toolName: string) {
  mcpStore.removeOverride(toolName);
  revalidatePath("/dashboard");
  return { success: true };
}
