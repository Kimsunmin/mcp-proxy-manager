"use client";

import { useCallback, useEffect, useState } from "react";
import { MCPTool } from "@/lib/mcp-store";

export function useTools() {
  const [tools, setTools] = useState<MCPTool[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTools = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 서버 API Route를 통해 툴 목록 조회 (서버가 SSE 연결 처리)
      const res = await fetch('/api/mcp/v1/tools');
      
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
  }, []);

  // 초기 로드
  useEffect(() => {
    fetchTools();
  }, [fetchTools]);

  return { tools, loading, error, refresh: fetchTools };
}
