import Link from "next/link";
import { ArrowRight, Bot, Database, Server, Settings } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navigation */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Server className="h-6 w-6" />
            <span>MCP Proxy Manager</span>
          </div>
          <nav className="flex gap-4">
            <Link
              href="/dashboard"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              대시보드
            </Link>
            <Link
              href="https://github.com/modelcontextprotocol"
              target="_blank"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              문서
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto flex flex-col items-center justify-center gap-8 py-24 px-4 text-center lg:py-32">
          <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
            <h1 className="text-4xl font-extrabold leading-tight tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Model Context Protocol <br className="hidden sm:inline" />
              <span className="text-blue-600 dark:text-blue-400">
                Management & Monitoring
              </span>
            </h1>
            <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
              MCP 서버의 도구, 리소스, 프롬프트를 실시간으로 관리하고 테스트하세요.
              <br className="hidden sm:inline" />
              개발자와 운영자를 위한 대시보드를 제공합니다.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link
              href="/dashboard"
              className="inline-flex h-12 items-center justify-center rounded-md bg-foreground px-8 text-sm font-medium text-background shadow transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              대시보드 시작하기
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="https://github.com/Kimsunmin/mcp-proxy-manager"
              target="_blank"
              className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              GitHub 방문하기
            </Link>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="container mx-auto py-12 px-4 md:py-24 lg:py-32 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl mb-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              주요 기능
            </h2>
            <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground text-lg">
              MCP 프록시 서버를 효율적으로 운영하기 위한 핵심 기능들을 제공합니다.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center p-6 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <Database className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-2">Live Metadata</h3>
              <p className="text-muted-foreground">
                실시간으로 연결된 MCP 서버의 도구와 리소스 메타데이터를 확인하고
                검증합니다.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                <Bot className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-2">Prompt Testing</h3>
              <p className="text-muted-foreground">
                다양한 도구 호출 시나리오를 시뮬레이션하고 프롬프트 엔지니어링을
                수행할 수 있습니다.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                <Settings className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-2">Easy Configuration</h3>
              <p className="text-muted-foreground">
                직관적인 UI를 통해 서버 설정을 관리하고 연결 상태를 모니터링할 수
                있습니다.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
          <div className="flex items-center gap-2 font-semibold">
            <Server className="h-5 w-5" />
            <span>MCP Proxy Manager</span>
          </div>
          <p className="text-center text-sm text-muted-foreground md:text-left">
            Built for{" "}
            <a
              href="https://modelcontextprotocol.io"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4 hover:text-primary"
            >
              Model Context Protocol
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
