import { Github, Twitter, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/60" />
              <span className="text-lg font-bold">NextJS Starter</span>
            </div>
            <p className="text-sm text-muted-foreground">
              A modern Next.js 15 starter template with Shadcn/UI components.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="https://nextjs.org/docs" className="transition-colors hover:text-foreground">
                  Documentation
                </a>
              </li>
              <li>
                <a href="https://ui.shadcn.com" className="transition-colors hover:text-foreground">
                  Shadcn/UI
                </a>
              </li>
              <li>
                <a href="https://tailwindcss.com" className="transition-colors hover:text-foreground">
                  Tailwind CSS
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Community</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="https://github.com/vercel/next.js" className="transition-colors hover:text-foreground">
                  GitHub
                </a>
              </li>
              <li>
                <a href="https://twitter.com/nextjs" className="transition-colors hover:text-foreground">
                  Twitter
                </a>
              </li>
              <li>
                <a href="https://nextjs.org/discord" className="transition-colors hover:text-foreground">
                  Discord
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">More</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="https://vercel.com" className="transition-colors hover:text-foreground">
                  Deploy on Vercel
                </a>
              </li>
              <li>
                <a href="https://nextjs.org/learn" className="transition-colors hover:text-foreground">
                  Learn Next.js
                </a>
              </li>
              <li>
                <a href="https://vercel.com/templates" className="transition-colors hover:text-foreground">
                  Templates
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2024 NextJS Starter. Built with Next.js 15 and Shadcn/UI.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="https://twitter.com"
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href="https://nextjs.org"
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Website"
            >
              <Globe className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
