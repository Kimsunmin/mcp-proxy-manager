import { mcpStore, MCPTool } from "@/lib/mcp-store";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    // MCPStore의 전역 설정값만 사용
    const config = mcpStore.getConfig();
    const sseUrl = `${config.baseUrl}${config.ssePath}`;
    if (!sseUrl || !sseUrl.startsWith("http")) {
        return new NextResponse("Invalid or missing SSE server URL", { status: 400 });
    }
    console.log(`[Proxy] Connecting to original MCP server: ${sseUrl}`);

    try {
        const originalResponse = await fetch(sseUrl, {
            method: "GET",
            headers: {
                Accept: "text/event-stream",
                "Cache-Control": "no-cache",
            },
            cache: "no-store",
            // @ts-ignore
            duplex: "half", 
        });

        if (!originalResponse.ok || !originalResponse.body) {
            console.error(`[Proxy] Failed to connect: ${originalResponse.status} ${originalResponse.statusText}`);
            console.error(`[Proxy] Response Body:`, await originalResponse.text().catch(() => "EMPTY"));
            return new NextResponse(`Failed to connect to MCP server: ${originalResponse.statusText}`, {
                status: 502,
            });
        }

        const transformStream = new TransformStream({
            start(controller) {
                (this as any).buffer = "";
                (this as any).decoder = new TextDecoder();
                (this as any).isEndpointEvent = false;
            },
            async transform(chunk, controller) {
                const ctx = this as any;
                
                const text = ctx.decoder.decode(chunk, { stream: true });
                ctx.buffer += text;

                const lines = ctx.buffer.split("\n");
                ctx.buffer = lines.pop() || "";

                for (const line of lines) {
                    const trimmedLine = line.trim();

                    // Debug: 모든 라인 로그 (너무 많으면 주석 처리)
                    if (trimmedLine.startsWith("event:")) {
                        console.log(`[Proxy] Event detected: ${trimmedLine}`);
                    }

                    // [1] 이벤트 타입 감지 (더 유연하게)
                    // "event: endpoint", "event:endpoint" 등등 모두 매칭
                    if (trimmedLine.startsWith("event:") && trimmedLine.includes("endpoint")) {
                        ctx.isEndpointEvent = true;
                        console.log(`[Proxy] ==> Endpoint event flag SET`);
                        controller.enqueue(new TextEncoder().encode(`${line}\n`));
                        continue;
                    }

                    // [2] 데이터 라인 처리
                    if (line.startsWith("data:")) {
                        // A. Endpoint 이벤트인 경우 URL 바꿔치기
                        if (ctx.isEndpointEvent) {
                            // "data: ..." -> "..."
                            const originalUrl = line.substring(5).trim(); 
                            console.log(`[Proxy] Processing endpoint data. Original: '${originalUrl}'`);

                            let sessionId = "";
                            if (originalUrl.includes("sessionId=")) {
                                const parts = originalUrl.split("sessionId=");
                                if (parts.length > 1) {
                                    sessionId = parts[1].split("&")[0];
                                }
                            }

                            // Proxy 엔드포인트로 교체
                            const proxyMessageUrl = `/api/mcp/v1/messages${sessionId ? `?sessionId=${sessionId}` : ''}`;
                            
                            console.log(`[Proxy] Rewriting endpoint: ${originalUrl} -> ${proxyMessageUrl}`);
                            
                            // "data: URL" 형식으로 전송
                            controller.enqueue(new TextEncoder().encode(`data: ${proxyMessageUrl}\n`));
                            
                            // Reset flag immediately after handling data for endpoint
                            ctx.isEndpointEvent = false; 
                            continue;
                        }

                        // B. 일반 데이터 (JSON) 처리
                        try {
                            const jsonStr = line.substring(5).trim();
                            if (!jsonStr || jsonStr === "[DONE]") {
                                controller.enqueue(new TextEncoder().encode(`${line}\n`));
                                continue;
                            }

                            let data;
                            try {
                                data = JSON.parse(jsonStr);
                            } catch {
                                controller.enqueue(new TextEncoder().encode(`${line}\n`));
                                continue;
                            }

                            if (data?.result?.tools && Array.isArray(data.result.tools)) {
                                console.log("[Proxy] Intercepted 'tools/list' response");
                                const modifiedTools = data.result.tools.map((originalTool: MCPTool) => {
                                    const override = mcpStore.getOverride(originalTool.name);
                                    if (override) {
                                        console.log(`[Proxy] Applying override for tool: ${originalTool.name}`);
                                        return { ...originalTool, ...override };
                                    }
                                    return originalTool;
                                });
                                data.result.tools = modifiedTools;
                                const modifiedJson = JSON.stringify(data);
                                controller.enqueue(new TextEncoder().encode(`data: ${modifiedJson}\n`));
                            } else {
                                // 다른 JSON 데이터
                                controller.enqueue(new TextEncoder().encode(`${line}\n`));
                            }
                        } catch (e) {
                            controller.enqueue(new TextEncoder().encode(`${line}\n`));
                        }
                    } else {
                        // data: 가 아닌 라인
                        if (trimmedLine === "") {
                             // 빈 줄이 나오면 이벤트 블록 종료로 간주 -> 플래그 리셋??
                             // 보통 event -> data -> \n\n 순서이므로, data 처리 후 리셋했다면 영향 없음.
                             // 하지만 안전을 위해 event만 오고 data 안 오고 끝나는 경우 대비
                             if (ctx.isEndpointEvent) {
                                 console.log(`[Proxy] Warning: Empty line received while Endpoint flag was true (missing data?). Resetting flag.`);
                                 ctx.isEndpointEvent = false;
                             }
                        }
                        controller.enqueue(new TextEncoder().encode(`${line}\n`));
                    }
                }
            }
        });

        const stream = originalResponse.body.pipeThrough(transformStream);

        return new NextResponse(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
                "Access-Control-Allow-Origin": "*",
            },
        });
    } catch (error) {
        console.error("[Proxy] Error inside route handler:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
