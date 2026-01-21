"use client";

import { useCallback, useEffect, useState } from "react";
import { MCPTool } from "@/lib/mcp-store";

export function useTools(serverUrl?: string) {
  const [tools, setTools] = useState<MCPTool[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTools = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 서버 API Route를 통해 툴 목록 조회 (서버가 SSE 연결 처리)
      // serverUrl이 있으면 쿼리 파라미터로 전달
      const apiUrl = serverUrl 
        ? `/api/mcp/v1/tools?url=${encodeURIComponent(serverUrl)}` 
        : '/api/mcp/v1/tools';

      const res = await fetch(apiUrl);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch tools: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      setTools(data);
    } catch (err: any) {
      console.error('[useTools] Error fetching tools:', err);
      setError(err?.message || 'Failed to load tools');
    } finally {
      setLoading(false);
    }
  }, [serverUrl]);

  // 초기 로드
  useEffect(() => {
    fetchTools();
  }, [fetchTools]);

  return { tools, loading, error, refresh: fetchTools };
}
