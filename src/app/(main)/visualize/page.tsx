
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useTheme } from "@/components/providers/theme-provider"
import { type RepoFile, type LoadedRepoInfo } from "@/lib/types"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Network, Download, ZoomIn, ZoomOut, GitCommit } from "lucide-react"

import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"
import type { Mermaid } from "mermaid"

const MermaidDiagram = ({ chart }: { chart: string }) => {
  const { theme } = useTheme();
  const [svg, setSvg] = useState<string | null>(null);
  const [mermaid, setMermaid] = useState<Mermaid | null>(null);

  useEffect(() => {
    import('mermaid').then(mermaidModule => {
      try {
        mermaidModule.default.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          fontFamily: 'Inter, sans-serif'
        });
        setMermaid(mermaidModule.default);
      } catch (e) {
        console.error("Could not initialize mermaid", e);
      }
    });
  }, []);

  useEffect(() => {
    if (chart && mermaid) {
        setSvg(null); 
        const renderAsync = async () => {
          try {
              const themedChart = `%%{init: {'theme': '${theme === 'dark' ? 'dark' : 'default'}'}}%%\n${chart}`;
              const { svg: renderedSvg } = await mermaid.render('graphDiv-visualize', themedChart);
              setSvg(renderedSvg);
          } catch (e) {
              console.error(e);
              setSvg(`<div class="text-destructive p-4">Error rendering diagram. Check console for details.</div>`);
          }
        };
        renderAsync();
    }
  }, [chart, theme, mermaid]);

  const handleDownload = () => {
    if (!svg) return;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "file-structure.svg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!mermaid) {
     return (
        <div className="flex justify-center items-center h-full text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading diagram engine...
        </div>
    );
  }

  if (!svg) {
    return (
        <div className="flex justify-center items-center h-full text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating diagram...
        </div>
    );
  }

  return (
    <div className="relative h-full w-full">
        <TransformWrapper initialScale={1.5} minScale={0.1} maxScale={10}>
            {({ zoomIn, zoomOut }) => (
                <>
                    <div className="absolute top-2 right-2 z-10 flex gap-2">
                        <Button size="icon" variant="outline" onClick={() => zoomIn()}>
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="outline" onClick={() => zoomOut()}>
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="outline" onClick={handleDownload} disabled={!svg}>
                            <Download className="h-4 w-4" />
                        </Button>
                    </div>
                    <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }} contentStyle={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div dangerouslySetInnerHTML={{ __html: svg }} />
                    </TransformComponent>
                </>
            )}
        </TransformWrapper>
    </div>
  );
};

const generateFileTreeGraph = (paths: string[]): string => {
  const tree: any = {};
  paths.slice(0, 200).forEach(path => {
    let currentLevel = tree;
    const parts = path.split('/');
    parts.forEach(part => {
      if (!currentLevel[part]) {
        currentLevel[part] = {};
      }
      currentLevel = currentLevel[part];
    });
  });

  let mermaidString = `graph TD;
    classDef dir fill:#5A94C7,stroke:#333,stroke-width:2px,color:#fff;
    classDef ts fill:#3178C6,stroke:#333,stroke-width:1px,color:#fff;
    classDef js fill:#F7DF1E,stroke:#333,stroke-width:1px,color:#000;
    classDef json fill:#F2C522,stroke:#333,stroke-width:1px,color:#000;
    classDef md fill:#eee,stroke:#333,stroke-width:1px,color:#333;
    classDef css fill:#264de4,stroke:#333,stroke-width:1px,color:#fff;
    classDef other fill:#BDBDBD,stroke:#333,stroke-width:1px,color:#000;
  \n`;
  let idCounter = 0;

  const sanitizeLabel = (text: string) => text.replace(/"/g, '#quot;');

  function buildMermaid(subtree: any, parentId: string) {
    Object.keys(subtree).forEach(key => {
      const childId = `id${idCounter++}`;
      const isDir = Object.keys(subtree[key]).length > 0;
      
      let nodeClass = 'other';
      if (isDir) {
        nodeClass = 'dir';
      } else if (key.endsWith('.ts') || key.endsWith('.tsx')) {
        nodeClass = 'ts';
      } else if (key.endsWith('.js') || key.endsWith('.jsx')) {
        nodeClass = 'js';
      } else if (key.endsWith('.json')) {
        nodeClass = 'json';
      } else if (key.endsWith('.md')) {
        nodeClass = 'md';
      } else if (key.endsWith('.css') || key.endsWith('.scss')) {
        nodeClass = 'css';
      }
      
      mermaidString += `    ${childId}["${sanitizeLabel(key)}"]:::${nodeClass};\n`;
      mermaidString += `    ${parentId} --> ${childId};\n`;
      
      if (isDir) {
        buildMermaid(subtree[key], childId);
      }
    });
  }

  const rootId = `id${idCounter++}`;
  mermaidString += `    ${rootId}["/"]:::dir;\n`;
  buildMermaid(tree, rootId);

  return mermaidString;
};

export default function VisualizePage() {
    const [loadedRepo] = useLocalStorage<LoadedRepoInfo | null>("gitorbit_loaded_repo", null)
    const [repoFiles] = useLocalStorage<RepoFile[]>("gitorbit_repo_files", [])
    const [mermaidChart, setMermaidChart] = useState("");

    useEffect(() => {
        if (repoFiles && repoFiles.length > 0) {
            const chart = generateFileTreeGraph(repoFiles.map(f => f.path));
            setMermaidChart(chart);
        } else {
            setMermaidChart(""); // Clear chart if repo is unloaded
        }
    }, [repoFiles]);

    if (!loadedRepo) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-4 sm:p-6 md:p-8 h-full">
                <GitCommit className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold">File Visualization</h2>
                <p className="text-muted-foreground mt-2 max-w-md">
                To visualize a repository, first load one on the{" "}
                <Button variant="link" asChild className="p-0 h-auto align-baseline text-base">
                    <Link href="/chat">Chat page</Link>
                </Button>
                .
                </p>
            </div>
        )
    }
    
    return (
        <div className="flex h-full flex-col gap-4 p-4 sm:p-6 md:p-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Network /> File Visualization
                    </CardTitle>
                    <CardDescription>
                        Visualizing file structure for{" "}
                        <a href={loadedRepo.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
                            {loadedRepo.owner}/{loadedRepo.repo}
                        </a>. Pan and zoom on the diagram.
                    </CardDescription>
                </CardHeader>
            </Card>
            <Card className="flex-1">
                <CardContent className="h-full p-2">
                    {mermaidChart ? (
                        <div className="h-full w-full rounded-md border bg-muted/50 overflow-hidden cursor-grab">
                            <MermaidDiagram chart={mermaidChart} />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing file structure...
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
