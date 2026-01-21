import { NextRequest, NextResponse } from "next/server";
import { mcpStore } from "@/lib/mcp-store";

// 💡 MCPStore의 전역 설정값만 사용
export async function POST(req: NextRequest) {
  const config = mcpStore.getConfig();
  const messageUrl = `${config.baseUrl}${config.messagePath}`;
  if (!messageUrl || !messageUrl.startsWith("http")) {
    return new NextResponse("Invalid or missing message server URL", { status: 400 });
  }

  // 쿼리 파라미터를 타겟 URL에 추가
  const incomingUrl = new URL(req.url);
  const targetUrl = new URL(messageUrl);
  incomingUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  console.log(`[Proxy-Message] Forwarding request to: ${targetUrl.toString()}`);

  try {
    const body = await req.json();
    const upstreamResponse = await fetch(targetUrl.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!upstreamResponse.ok) {
      console.error(`[Proxy-Message] Upstream error: ${upstreamResponse.status}`);
      return new NextResponse(upstreamResponse.statusText, { status: upstreamResponse.status });
    }

    const upstreamData = await upstreamResponse.text();
    return new NextResponse(upstreamData, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[Proxy-Message] Error forwarding message:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}