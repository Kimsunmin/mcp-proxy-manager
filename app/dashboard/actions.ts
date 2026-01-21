"use server";

import { mcpStore } from "@/lib/mcp-store";
import { revalidatePath } from "next/cache";

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

export async function saveServerConfig(baseUrl: string, ssePath: string, messagePath: string) {
  mcpStore.setConfig({ baseUrl, ssePath, messagePath });
  revalidatePath("/dashboard");
  return { success: true };
}
