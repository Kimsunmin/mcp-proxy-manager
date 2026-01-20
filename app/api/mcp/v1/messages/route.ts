import { NextRequest, NextResponse } from "next/server";

// 💡 환경 변수 설정
// SSE 엔드포인트 URL을 기반으로 메시지 엔드포인트를 유추합니다.
const ORIGINAL_MCP_URL = process.env.ORIGINAL_MCP_URL || "http://localhost:8080/sse";
const TARGET_MESSAGE_URL = process.env.ORIGINAL_MCP_MESSAGE_URL || ORIGINAL_MCP_URL.replace(/\/sse\/?$/, "/mcp/message");

export async function POST(req: NextRequest) {
  // 클라이언트 요청의 쿼리 파라미터(sessionId 등)를 그대로 전달하기 위해 URL 구성
  const incomingUrl = new URL(req.url);
  const targetUrl = new URL(TARGET_MESSAGE_URL);
  
  // 들어오는 모든 쿼리 파라미터를 타겟 URL에 추가/덮어쓰기
  incomingUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  console.log(`[Proxy-Message] Forwarding request to: ${targetUrl.toString()}`);

  try {
    // 1. 클라이언트의 요청 바디 가져오기
    // (JSON-RPC 메시지가 들어있음)
    const body = await req.json();

    // 2. 원본 서버로 그대로 전달 (Proxy)
    const upstreamResponse = await fetch(targetUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 필요한 경우 인증 헤더 등을 추가로 전달해야 할 수 있음
      },
      body: JSON.stringify(body),
    });

    if (!upstreamResponse.ok) {
      console.error(`[Proxy-Message] Upstream error: ${upstreamResponse.status}`);
      return new NextResponse(upstreamResponse.statusText, { status: upstreamResponse.status });
    }

    // 3. 원본 서버의 응답을 클라이언트에게 반환
    // (보통 툴 실행 결과 등이 담겨있음)
    const upstreamData = await upstreamResponse.text();
    
    return new NextResponse(upstreamData, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });

  } catch (error) {
    console.error("[Proxy-Message] Error forwarding message:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}