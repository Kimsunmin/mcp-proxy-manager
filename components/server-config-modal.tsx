"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";

interface ServerConfigModalProps {
  currentBaseUrl?: string;
  currentSsePath?: string;
  currentMessagePath?: string;
  onApply?: (config: { baseUrl: string; ssePath: string; messagePath: string }) => void;
}

const DEFAULT_BASE_URL = process.env.NEXT_PUBLIC_MCP_BASE_URL || "http://localhost:8080";
const DEFAULT_SSE_PATH = process.env.NEXT_PUBLIC_MCP_SSE_PATH || "/sse";
const DEFAULT_MESSAGE_PATH = process.env.NEXT_PUBLIC_MCP_MESSAGE_PATH || "/mcp/message";

export function ServerConfigModal({ currentBaseUrl, currentSsePath, currentMessagePath, onApply }: ServerConfigModalProps) {
  const [open, setOpen] = useState(false);
  const [baseUrl, setBaseUrl] = useState(currentBaseUrl ?? DEFAULT_BASE_URL);
  const [ssePath, setSsePath] = useState(currentSsePath ?? DEFAULT_SSE_PATH);
  const [messagePath, setMessagePath] = useState(currentMessagePath ?? DEFAULT_MESSAGE_PATH);
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const validateBaseUrl = (input: string) => {
    const urlPattern = /^https?:\/\/.+/;
    const valid = urlPattern.test(input);
    setIsValid(valid);
    setErrorMessage(valid ? "" : "유효한 URL 형식을 입력하세요 (예: http://localhost:8080)");
    return valid;
  };

  const handleBaseUrlChange = (value: string) => {
    setBaseUrl(value);
    validateBaseUrl(value);
  };

  const handleApply = () => {
    if (validateBaseUrl(baseUrl)) {
      onApply?.({ baseUrl, ssePath, messagePath });
      setOpen(false);
    }
  };

  const handleCancel = () => {
    setBaseUrl(currentBaseUrl ?? DEFAULT_BASE_URL);
    setSsePath(currentSsePath ?? DEFAULT_SSE_PATH);
    setMessagePath(currentMessagePath ?? DEFAULT_MESSAGE_PATH);
    setIsValid(true);
    setErrorMessage("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Server Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>MCP Server Configuration</DialogTitle>
          <DialogDescription>
            MCP 서버의 주소와 엔드포인트를 설정하세요. 변경 후 툴 목록이 자동으로 업데이트됩니다.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="base-url" className="text-left">
              Base URL
            </Label>
            <div className="col-span-3">
              <Input
                id="base-url"
                value={baseUrl}
                onChange={(e) => handleBaseUrlChange(e.target.value)}
                className={!isValid ? "border-red-500 focus-visible:ring-red-500" : ""}
                placeholder={DEFAULT_BASE_URL}
              />
              {!isValid && (
                <p className="text-sm text-red-500 mt-1">{errorMessage}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sse-path" className="text-left">
              SSE Path
            </Label>
            <div className="col-span-3">
              <Input
                id="sse-path"
                value={ssePath}
                onChange={(e) => setSsePath(e.target.value)}
                placeholder={DEFAULT_SSE_PATH}
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="message-path" className="text-left">
              Message Path
            </Label>
            <div className="col-span-3">
              <Input
                id="message-path"
                value={messagePath}
                onChange={(e) => setMessagePath(e.target.value)}
                placeholder={DEFAULT_MESSAGE_PATH}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={!isValid}>
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}