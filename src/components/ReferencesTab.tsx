import { useState } from 'react';
import {
  ExternalLink,
  Youtube,
  Globe,
  Code,
  Layers,
  Copy,
  Check,
  Play,
  FileText,
  Sparkles,
  Server,
  Cloud
} from 'lucide-react';
import { REFERENCES_DATA } from '../data/sourdoughData';

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
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 border border-stone-800 shadow-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono border border-amber-500/30">
          <Sparkles className="w-3.5 h-3.5" />
          Primary Sources & Framework Architecture
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
          References, Video Guides & Frameworks
        </h1>
        <p className="text-stone-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
          Comprehensive companion materials from Tom Cucuzza’s research at <strong>The Sourdough Journey</strong>, direct YouTube masterclasses, and deployment specifications for <strong>Vercel</strong> and the <strong>Wasp TypeScript Framework</strong>.
        </p>
      </div>

      {/* Section 1: YouTube Masterclass Videos */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-red-100 text-red-700">
            <Youtube className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">
              The Sourdough Journey YouTube Video Masterclasses
            </h2>
            <p className="text-xs text-stone-500">
              Direct links to Tom Cucuzza's three seminal videos on bulk fermentation, crumb reading, and sensory cues
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {REFERENCES_DATA.filter((r) => r.category === 'youtube').map((ref) => {
            const isEmbedActive = activeVideoEmbed === ref.youtubeId;

            return (
              <div
                key={ref.url}
                className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col justify-between"
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
                        <button
                          type="button"
                          onClick={() => setActiveVideoEmbed(ref.youtubeId || null)}
                          className="w-12 h-12 rounded-full bg-red-600 group-hover:bg-red-500 text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110"
                          aria-label="Play video"
                        >
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </button>
                      </div>
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-stone-900/80 backdrop-blur-sm text-[10px] font-mono text-amber-300 font-semibold">
                        {ref.badge}
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <h3 className="font-bold text-stone-900 text-sm leading-snug">
                      {ref.title}
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {ref.description}
                    </p>

                    {ref.bulletPoints && (
                      <ul className="space-y-1 text-[11px] text-stone-600 list-disc list-inside">
                        {ref.bulletPoints.map((pt, i) => (
                          <li key={i}>{pt}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[11px] text-stone-400 font-mono">
                      By {ref.author}
                    </span>
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700"
                    >
                      Watch on YouTube
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Web Links & Community Resources */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">
              Web Resources & Guides
            </h2>
            <p className="text-xs text-stone-500">
              Official publications, printable worksheets, and research papers
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-700 uppercase">
                  Primary Research Portal
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  thesourdoughjourney.com
                </span>
              </div>
              <h3 className="font-bold text-stone-900 text-base">
                The Sourdough Journey Official Hub
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Tom Cucuzza’s official website containing comprehensive fermentation guides, experiments, sourdough starter troubleshooting, and free downloadable PDFs.
              </p>
            </div>
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
              <a
                href="https://thesourdoughjourney.com/donate"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-amber-700 hover:underline font-medium"
              >
                Support TSJ Research (Donate)
              </a>
              <a
                href="https://thesourdoughjourney.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
              >
                Visit Site
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-sky-700 uppercase">
                  Full-Stack Architecture
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
                  wasp.sh
                </span>
              </div>
              <h3 className="font-bold text-stone-900 text-base">
                Wasp TypeScript Framework
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Wasp is the modern, declarative full-stack TypeScript framework that combines React, Node.js, and Prisma into a cohesive system with built-in Auth, database migrations, and jobs.
              </p>
            </div>
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
              <span className="text-xs text-stone-500 font-mono">React 19 + Node.js</span>
              <a
                href="https://wasp.sh/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-sky-700 hover:bg-sky-600 text-white rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
              >
                Learn Wasp
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Wasp Architecture Specification & Vercel Hosting Guide */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-stone-100 text-stone-800">
            <Code className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">
              Wasp Framework Specification & Vercel Deployment
            </h2>
            <p className="text-xs text-stone-500">
              Deploy to Vercel with zero-configuration or export as a full Wasp application
            </p>
          </div>
        </div>

        {/* Vercel Guide Card */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-base">
            <Cloud className="w-5 h-5 text-stone-900" />
            Vercel Hosting Instructions (Included in this repo)
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            This application is already configured with a production-ready <code className="bg-stone-100 px-1 py-0.5 rounded font-mono text-stone-900">vercel.json</code> file at the root. You can host this directly on Vercel with two simple options:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
              <span className="font-bold text-stone-900 block">Option A: Deploy via GitHub</span>
              <p className="text-stone-600">
                1. Push this repository to your GitHub account.<br />
                2. Go to <strong>vercel.com/new</strong> and import the repo.<br />
                3. Vercel auto-detects Vite and builds with <code className="bg-stone-200/70 px-1 rounded font-mono">npm run build</code> into <code className="bg-stone-200/70 px-1 rounded font-mono">dist/</code>.
              </p>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
              <span className="font-bold text-stone-900 block">Option B: Deploy via Vercel CLI</span>
              <p className="text-stone-600">
                Run in your terminal:<br />
                <code className="block bg-stone-900 text-stone-100 p-1.5 rounded font-mono mt-1 text-[11px]">
                  npm i -g vercel<br />
                  vercel --prod
                </code>
              </p>
            </div>
          </div>
        </div>

        {/* Wasp Specification Code Box */}
        <div className="bg-stone-900 text-stone-100 rounded-2xl border border-stone-800 shadow-md overflow-hidden">
          <div className="p-4 bg-stone-950/80 border-b border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-amber-400" />
              <span className="font-mono text-xs font-semibold text-stone-200">
                main.wasp (Wasp Declarative Spec for Ferment)
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyWasp}
              className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded text-xs font-mono flex items-center gap-1.5 transition-colors"
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
            </button>
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
        </div>
      </div>
    </div>
  );
}
