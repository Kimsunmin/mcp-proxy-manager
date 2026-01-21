// components/tool-card.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { saveToolOverride, resetToolOverride } from "@/app/dashboard/actions";
import { RotateCcw, Save, Pencil } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { MCPTool } from "@/lib/mcp-store";

interface ToolCardProps {
  tool: MCPTool;
  onRefresh?: () => void;
}

export function ToolCard({ tool, onRefresh }: ToolCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(tool.description || "");
  const [isSaving, setIsSaving] = useState(false);

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
    <Card className={`flex flex-col h-full transition-all ${tool._isOverridden ? "border-blue-400 bg-blue-50/10" : ""}`}>
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg font-bold font-mono tracking-tight truncate" title={tool.name}>
            {tool.name}
          </CardTitle>
          {tool._isOverridden && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
              Modified
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-3">
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
        {isEditing ? (
          <div className="flex w-full gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setIsEditing(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSave} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        ) : (
          <div className="flex w-full justify-end gap-2">
            {tool._isOverridden && (
              <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground hover:text-red-500">
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit Prompt
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}