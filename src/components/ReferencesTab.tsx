import { useState } from 'react';
import {
  ExternalLink,
  Youtube,
  Globe,
  Play,
  FileText
} from 'lucide-react';
import { REFERENCES_DATA } from '../data/sourdoughData';
import { Card, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export function ReferencesTab() {
  const [activeVideoEmbed, setActiveVideoEmbed] = useState<string | null>(null);

  const youtubeVideos = REFERENCES_DATA.filter((r) => r.category === 'youtube');

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Sleek Header */}
      <div className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-2xl p-4 sm:p-5 border border-stone-200/90 dark:border-stone-800 shadow-sm flex items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">
            Guides &amp; References
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            The Sourdough Journey research, masterclasses, and companion guides
          </p>
        </div>
      </div>

      {/* Section 1: Video Masterclasses */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Youtube className="w-4 h-4 text-red-600 dark:text-red-400" />
          <h2 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider">
            Video Masterclasses
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {youtubeVideos.map((ref) => {
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
                          className="w-11 h-11 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-lg transition-transform group-hover:scale-110 cursor-pointer"
                          aria-label="Play video"
                        >
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </Button>
                      </div>
                      <div className="absolute top-2 left-2">
                        <Badge variant="amber" className="bg-stone-900/90 text-amber-300 border-stone-800 font-mono text-[10px] py-0 px-1.5">
                          {ref.badge}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <CardContent className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
                  <div className="space-y-1">
                    <h3 className="font-bold text-stone-900 dark:text-white text-xs leading-snug line-clamp-2">
                      {ref.title}
                    </h3>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                      By {ref.author}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-end">
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                    >
                      <span>Watch on YouTube</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Section 2: Web Resources & TSJ Hub */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <h2 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider">
            Web Resources &amp; Publications
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-4 sm:p-5 border-stone-200 dark:border-stone-800 shadow-sm space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400 uppercase">
                  Primary Research Portal
                </span>
                <Badge variant="outline" className="text-[10px] bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800">
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
            <div className="pt-2.5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <a
                href="https://thesourdoughjourney.com/donate"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-amber-700 dark:text-amber-400 hover:underline font-medium"
              >
                Support Research (Donate)
              </a>
              <a
                href="https://thesourdoughjourney.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="default" size="sm" className="gap-1.5 text-xs font-medium h-8">
                  Visit Site
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </a>
            </div>
          </Card>

          <Card className="p-4 sm:p-5 border-stone-200 dark:border-stone-800 shadow-sm space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-sky-700 dark:text-sky-400 uppercase">
                  Printable Guides
                </span>
                <Badge variant="outline" className="text-[10px] bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800">
                  PDF Worksheets
                </Badge>
              </div>
              <CardTitle className="font-bold text-stone-900 dark:text-white text-base">
                Sourdough Journey Research Papers
              </CardTitle>
              <CardDescription className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                Download printable temperature lookup sheets, bulk fermentation rise curves, and thermal cooling rate charts for your kitchen binder.
              </CardDescription>
            </div>
            <div className="pt-2.5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <span className="text-xs text-stone-500 dark:text-stone-400 font-mono">Free Download</span>
              <a
                href="https://thesourdoughjourney.com/wp-content/uploads/2024/01/The-Sourdough-Journey-Bulk-Fermentation-Guide-2024.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="gap-1.5 text-xs font-medium h-8">
                  <FileText className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                  View Guide PDF
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
