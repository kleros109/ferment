import { useState } from 'react';
import {
  ExternalLink,
  Youtube,
  Globe,
  Code,
  Copy,
  Check,
  Play,
  Sparkles,
  Server,
  Cloud
} from 'lucide-react';
import { REFERENCES_DATA } from '../data/sourdoughData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export function ReferencesTab() {
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [activeVideoEmbed, setActiveVideoEmbed] = useState<string | null>(null);

  const waspCode = `// main.wasp - Wasp TypeScript Framework Configuration for Ferment
app FermentApp {
  wasp: {
    version: "^0.13.0"
  },
  title: "Ferment – Sourdough Bulk Fermentation Tracker",
  client: {
    rootComponent: import { App } from "@src/App",
    setupFn: import { setupClient } from "@src/clientSetup"
  },
  db: {
    system: PostgreSQL
  },
  auth: {
    userEntity: User,
    methods: {
      usernameAndPassword: {}
    },
    onAuthFailedRedirectTo: "/login"
  }
}

entity User {=psl
  id          Int           @id @default(autoincrement())
  username    String        @unique
  password    String
  bakes       BakeSession[]
psl=}

entity BakeSession {=psl
  id             String    @id @default(uuid())
  user           User      @relation(fields: [userId], references: [id])
  userId         Int
  createdAt      DateTime  @default(now())
  title          String
  doughTempF     Float
  startingVolMl  Int
  targetRisePct  Int
  targetVolMl    Int
  actualEndingMl Int?
  crumbOutcome   String?
  notes          String?
psl=}

// Operations
query getBakes {
  fn: import { getBakes } from "@src/queries",
  entities: [BakeSession]
}

action saveBake {
  fn: import { saveBake } from "@src/actions",
  entities: [BakeSession]
}

route RootRoute { path: "/", to: MainPage }
page MainPage {
  authRequired: false,
  component: import { App } from "@src/App"
}
`;

  const handleCopyWasp = () => {
    navigator.clipboard.writeText(waspCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-2xl p-6 border border-stone-200/90 dark:border-stone-800 shadow-sm dark:shadow-xl space-y-3">
        <div className="mb-2">
          <Badge variant="amber" className="gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Primary Sources & Framework Architecture
          </Badge>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white">
          References, Video Guides & Frameworks
        </h1>
        <p className="text-stone-600 dark:text-stone-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
          Comprehensive companion materials from Tom Cucuzza’s research at <strong>The Sourdough Journey</strong>, direct YouTube masterclasses, and deployment specifications for <strong>Vercel</strong> and the <strong>Wasp TypeScript Framework</strong>.
        </p>
      </div>

      {/* Section 1: YouTube Masterclass Videos */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300">
            <Youtube className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-white">
              The Sourdough Journey YouTube Video Masterclasses
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Direct links to Tom Cucuzza's three seminal videos on bulk fermentation, crumb reading, and sensory cues
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {REFERENCES_DATA.filter((r) => r.category === 'youtube').map((ref) => {
            const isEmbedActive = activeVideoEmbed === ref.youtubeId;

            return (
              <Card
                key={ref.url}
                className="border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden flex flex-col justify-between"
              >
                {/* Video Preview / Embed */}
                <div className="relative aspect-video bg-stone-900 overflow-hidden">
                  {isEmbedActive && ref.youtubeId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${ref.youtubeId}?autoplay=1`}
                      title={ref.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="relative w-full h-full group">
                      <img
                        src={`https://img.youtube.com/vi/${ref.youtubeId}/hqdefault.jpg`}
                        alt={ref.title}
                        className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-stone-950/40 flex items-center justify-center group-hover:bg-stone-950/25 transition-colors">
                        <Button
                          type="button"
                          size="icon"
                          onClick={() => setActiveVideoEmbed(ref.youtubeId || null)}
                          className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-lg transition-transform group-hover:scale-110"
                          aria-label="Play video"
                        >
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </Button>
                      </div>
                      <div className="absolute top-2 left-2">
                        <Badge variant="amber" className="bg-stone-900/90 text-amber-300 border-stone-800 font-mono text-[10px]">
                          {ref.badge}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <h3 className="font-bold text-stone-900 dark:text-white text-sm leading-snug">
                      {ref.title}
                    </h3>
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                      {ref.description}
                    </p>

                    {ref.bulletPoints && (
                      <ul className="space-y-1 text-[11px] text-stone-600 dark:text-stone-400 list-disc list-inside">
                        {ref.bulletPoints.map((pt, i) => (
                          <li key={i}>{pt}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                    <span className="text-[11px] text-stone-400 dark:text-stone-500 font-mono">
                      By {ref.author}
                    </span>
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                    >
                      Watch on YouTube
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Section 2: Web Links & Community Resources */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-white">
              Web Resources & Guides
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Official publications, printable worksheets, and research papers
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-5 border-stone-200 dark:border-stone-800 shadow-sm space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400 uppercase">
                  Primary Research Portal
                </span>
                <Badge variant="outline" className="text-[11px] bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                  thesourdoughjourney.com
                </Badge>
              </div>
              <CardTitle className="font-bold text-stone-900 dark:text-white text-base">
                The Sourdough Journey Official Hub
              </CardTitle>
              <CardDescription className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                Tom Cucuzza’s official website containing comprehensive fermentation guides, experiments, sourdough starter troubleshooting, and free downloadable PDFs.
              </CardDescription>
            </div>
            <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <a
                href="https://thesourdoughjourney.com/donate"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-amber-700 dark:text-amber-400 hover:underline font-medium"
              >
                Support TSJ Research (Donate)
              </a>
              <a
                href="https://thesourdoughjourney.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="default" size="sm" className="gap-1.5 text-xs font-medium">
                  Visit Site
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </a>
            </div>
          </Card>

          <Card className="p-5 border-stone-200 dark:border-stone-800 shadow-sm space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-sky-700 dark:text-sky-400 uppercase">
                  Full-Stack Architecture
                </span>
                <Badge variant="outline" className="text-[11px] bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800">
                  wasp.sh
                </Badge>
              </div>
              <CardTitle className="font-bold text-stone-900 dark:text-white text-base">
                Wasp TypeScript Framework
              </CardTitle>
              <CardDescription className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                Wasp is the modern, declarative full-stack TypeScript framework that combines React, Node.js, and Prisma into a cohesive system with built-in Auth, database migrations, and jobs.
              </CardDescription>
            </div>
            <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <span className="text-xs text-stone-500 dark:text-stone-400 font-mono">React 19 + Node.js</span>
              <a
                href="https://wasp.sh/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="default" size="sm" className="bg-sky-700 hover:bg-sky-600 text-white gap-1.5 text-xs font-medium">
                  Learn Wasp
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </a>
            </div>
          </Card>
        </div>
      </div>

      {/* Section 3: Wasp Architecture Specification & Vercel Hosting Guide */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200">
            <Code className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-white">
              Wasp Framework Specification & Vercel Deployment
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Deploy to Vercel with zero-configuration or export as a full Wasp application
            </p>
          </div>
        </div>

        {/* Vercel Guide Card */}
        <Card className="border-stone-200 dark:border-stone-800 shadow-sm">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="flex items-center gap-2 text-stone-900 dark:text-white font-bold text-base">
              <Cloud className="w-5 h-5 text-stone-900 dark:text-stone-100" />
              Vercel Hosting Instructions (Included in this repo)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-3">
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              This application is already configured with a production-ready <code className="bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded font-mono text-stone-900 dark:text-stone-100">vercel.json</code> file at the root. You can host this directly on Vercel with two simple options:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 space-y-1.5">
                <span className="font-bold text-stone-900 dark:text-stone-100 block">Option A: Deploy via GitHub</span>
                <p className="text-stone-600 dark:text-stone-300">
                  1. Push this repository to your GitHub account.<br />
                  2. Go to <strong>vercel.com/new</strong> and import the repo.<br />
                  3. Vercel auto-detects Vite and builds with <code className="bg-stone-200/70 dark:bg-stone-700 px-1 rounded font-mono">npm run build</code> into <code className="bg-stone-200/70 dark:bg-stone-700 px-1 rounded font-mono">dist/</code>.
                </p>
              </div>

              <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 space-y-1.5">
                <span className="font-bold text-stone-900 dark:text-stone-100 block">Option B: Deploy via Vercel CLI</span>
                <p className="text-stone-600 dark:text-stone-300">
                  Run in your terminal:<br />
                  <code className="block bg-stone-900 text-stone-100 p-1.5 rounded font-mono mt-1 text-[11px]">
                    npm i -g vercel<br />
                    vercel --prod
                  </code>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wasp Specification Code Box */}
        <Card className="bg-stone-900 text-stone-100 border-stone-800 shadow-md overflow-hidden">
          <div className="p-4 bg-stone-950/80 border-b border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-amber-400" />
              <span className="font-mono text-xs font-semibold text-stone-200">
                main.wasp (Wasp Declarative Spec for Ferment)
              </span>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleCopyWasp}
              className="gap-1.5 text-xs font-mono"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Copied Spec!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy main.wasp
                </>
              )}
            </Button>
          </div>

          <pre className="p-4 text-xs font-mono text-stone-300 overflow-x-auto max-h-72 overflow-y-auto leading-relaxed">
            <code>{waspCode}</code>
          </pre>

          <div className="p-3 bg-stone-950/50 border-t border-stone-800 text-[11px] text-stone-400 flex items-center justify-between">
            <span>To run locally with Wasp: <code className="text-amber-300 font-mono">wasp new FermentApp && wasp start</code></span>
            <a
              href="https://wasp.sh/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:underline flex items-center gap-1"
            >
              Wasp Docs <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
