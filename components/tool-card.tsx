// components/tool-card.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { saveToolOverride, resetToolOverride } from "@/app/dashboard/actions";
import { RotateCcw, Save, Pencil, Maximize2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { MCPTool } from "@/lib/mcp-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

interface ToolCardProps {
  tool: MCPTool;
  onRefresh?: () => void;
}

export function ToolCard({ tool, onRefresh }: ToolCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(tool.description || "");
  const [isSaving, setIsSaving] = useState(false);
  const [schemaOpen, setSchemaOpen] = useState(false);
  const [fullModalOpen, setFullModalOpen] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await saveToolOverride(tool.name, description);
    setIsSaving(false);
    setIsEditing(false);
    onRefresh?.();
  };

  const handleReset = async () => {
    if (!confirm("원본 설명으로 되돌리시겠습니까?")) return;
    setIsSaving(true);
    await resetToolOverride(tool.name);
    setDescription(tool._originalDescription || ""); // 원본으로 복구 시각적 처리
    setIsSaving(false);
    onRefresh?.();
  };

  return (
    <>
      <Card
        className={`flex flex-col h-full transition-all relative ${tool._isOverridden ? "border-blue-400 bg-blue-50/10" : ""}`}
        style={{ minHeight: 0 }}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-lg font-bold font-mono tracking-tight truncate" title={tool.name}>
              {tool.name}
            </CardTitle>
            <div className="flex items-center gap-1">
              {tool._isOverridden && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                  Modified
                </Badge>
              )}
              {/* 전체보기(모달) 아이콘 */}
              <Button
                variant="ghost"
                size="icon"
                className="ml-1 p-1 h-7 w-7 text-muted-foreground hover:text-blue-500"
                onClick={() => setFullModalOpen(true)}
                title="전체보기"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent
          className="flex-1 space-y-3 overflow-y-auto max-h-[260px] min-h-0"
          style={{ minHeight: 0 }}
        >
          {isEditing ? (
            <div className="space-y-2">
              <Label htmlFor={`desc-${tool.name}`} className="text-xs text-muted-foreground">
                Description (Prompt) Override
              </Label>
              <Textarea
                id={`desc-${tool.name}`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px] resize-none focus-visible:ring-blue-400"
                placeholder="Enter optimized tool description..."
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Description</Label>
              <div className="text-sm text-foreground/90 leading-relaxed min-h-[60px]">
                {tool.description ? (
                  <ReactMarkdown
                    components={{
                      ul: (props) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />, 
                      ol: (props) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                      li: (props) => <li className="pl-1" {...props} />,
                      p: (props) => <p className="leading-relaxed mb-2 last:mb-0" {...props} />,
                      a: (props) => <a className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                      code: (props) => <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs" {...props} />,
                      pre: (props) => <div className="bg-muted p-2 rounded-md overflow-x-auto text-xs my-2 border"><pre {...props} /></div>,
                      strong: (props) => <strong className="font-semibold text-foreground" {...props} />,
                    }}
                  >
                    {tool.description}
                  </ReactMarkdown>
                ) : (
                  <span className="text-muted-foreground italic">No description provided.</span>
                )}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-2 border-t bg-muted/20 mt-auto">
          <div className="flex w-full justify-between gap-2">
            {/* 왼쪽: Input Schema 버튼 */}
            <div>
              {tool.inputSchema && (
                <Dialog open={schemaOpen} onOpenChange={setSchemaOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setSchemaOpen(true)}>
                      Input Schema
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Input Schema</DialogTitle>
                    </DialogHeader>
                    <pre className="text-xs font-mono overflow-x-auto p-2 bg-muted/50 rounded border border-dashed">
                      {JSON.stringify(tool.inputSchema, null, 2)}
                    </pre>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            {/* 오른쪽: 수정/리셋/프롬프트 버튼 */}
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" className="flex-1" onClick={() => setIsEditing(false)} disabled={isSaving}>
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={handleSave} disabled={isSaving}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </>
              ) : (
                <>
                  {tool._isOverridden && (
                    <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground hover:text-red-500">
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Reset
                    </Button>
                  )}
                  <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* 전체보기 Sheet (사이드 패널) */}
      <Sheet open={fullModalOpen} onOpenChange={setFullModalOpen}>
        <SheetContent className="sm:max-w-2xl w-[90vw] overflow-y-auto pl-4" side="right">
          <SheetHeader className="pb-2">
            <SheetTitle className="font-mono font-bold text-xl break-all loading-tight text-left">
              {tool.name}
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex flex-col space-y-6">
            {/* 상단: 설명 */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">Description</h3>
              <div className="bg-muted/30 p-4 rounded-lg border text-sm text-foreground/90 leading-relaxed">
                {tool.description ? (
                  <ReactMarkdown
                    components={{
                      ul: (props) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />, 
                      ol: (props) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                      li: (props) => <li className="pl-1" {...props} />,
                      p: (props) => <p className="leading-relaxed mb-2 last:mb-0" {...props} />,
                      a: (props) => <a className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                      code: (props) => <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs" {...props} />,
                      pre: (props) => <div className="bg-muted p-2 rounded-md overflow-x-auto text-xs my-2 border"><pre {...props} /></div>,
                      strong: (props) => <strong className="font-semibold text-foreground" {...props} />,
                    }}
                  >
                    {tool.description}
                  </ReactMarkdown>
                ) : (
                  <span className="text-muted-foreground italic">No description provided.</span>
                )}
              </div>
            </div>

            <Separator />

            {/* 하단: Input Schema */}
            <div className="space-y-2 pb-6">
              <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">Input Schema</h3>
              {tool.inputSchema ? (
                <div className="rounded-lg border bg-muted/50 p-4 overflow-x-auto">
                  <pre className="text-xs font-mono leading-relaxed whitespace-pre-wrap break-all">
                    {JSON.stringify(tool.inputSchema, null, 2)}
                  </pre>
                </div>
              ) : (
                <span className="text-muted-foreground italic">No input schema.</span>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}