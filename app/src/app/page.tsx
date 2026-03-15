"use client";

import { Button } from "@/components/ui/button";
import { BASE_API_URL } from "@/lib/consts";
import { getPublicStats, type PublicStats } from "@/client/admin";
import {
  Receipt,
  Users,
  Play,
  Camera,
  Smartphone,
  Zap,
  ScanLine,
  Brain,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

function AnimatedCounter({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const startTime = performance.now();
          const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return (
    <span ref={ref} className="number-counter">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export default function Home() {
  const [showVideo, setShowVideo] = useState(false);
  const [stats, setStats] = useState<PublicStats | null>(null);

  useEffect(() => {
    getPublicStats()
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 overflow-hidden">
      {/* Hero Section */}
      <section className="relative container mx-auto px-4 pt-20 pb-16 flex flex-col items-center justify-center text-center">
        <div className="absolute inset-0 pattern-dots opacity-5 pointer-events-none" />

        <div className="relative z-10 space-y-8 max-w-5xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-card/50 glass text-sm text-muted-foreground animate-fade-in">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>AI-Powered Receipt Parsing</span>
            <span className="h-1 w-1 rounded-full bg-primary" />
            <span>Splitwise Integration</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight animate-slide-up">
            <span className="text-gradient-animated">AI Powered</span>
            <br />
            <span className="text-foreground">Itemized Expense</span>
            <br />
            <span className="text-gradient-animated">Splitter</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-slide-up animation-delay-100">
            Snap a receipt, let AI parse every item, and split costs fairly
            across your group. No manual math. No awkward follow-ups.
            Powered by OCR + AI intelligence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up animation-delay-200">
            <Button size="lg" className="text-lg px-8 py-6 gap-2 animate-pulse-glow" asChild>
              <Link href={`${BASE_API_URL}/login/auth`}>
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setShowVideo(true)}
              className="text-lg px-8 py-6 gap-2"
            >
              <Play className="h-5 w-5" />
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Floating decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Video Section */}
      {showVideo && (
        <section className="container mx-auto px-4 pb-16">
          <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="relative aspect-video rounded-xl overflow-hidden border bg-card shadow-lg">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/hE0lltGmUa0?autoplay=1"
                title="Splitmate Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>
      )}

      {/* Live Analytics Section */}
      {stats && (
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <div className="group relative p-6 rounded-2xl border bg-card/80 glass hover-lift text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-foreground">
                  <AnimatedCounter end={stats.totalUsers} suffix="+" />
                </div>
                <p className="text-sm text-muted-foreground mt-1">Active Users</p>
              </div>

              <div className="group relative p-6 rounded-2xl border bg-card/80 glass hover-lift text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <ScanLine className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-foreground">
                  <AnimatedCounter end={stats.totalReceipts} suffix="+" />
                </div>
                <p className="text-sm text-muted-foreground mt-1">Receipts Scanned</p>
              </div>

              <div className="group relative p-6 rounded-2xl border bg-card/80 glass hover-lift text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Receipt className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-foreground">
                  <AnimatedCounter end={stats.totalExpenses} suffix="+" />
                </div>
                <p className="text-sm text-muted-foreground mt-1">Expenses Split</p>
              </div>

              <div className="group relative p-6 rounded-2xl border bg-card/80 glass hover-lift text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-foreground">
                  $<AnimatedCounter end={Math.round(stats.totalAmountSplit)} suffix="+" />
                </div>
                <p className="text-sm text-muted-foreground mt-1">Worth of Expenses Split</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            Three simple steps to split any receipt with your group
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative group">
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                1
              </div>
              <div className="p-8 rounded-2xl border bg-card/80 glass hover-lift h-full">
                <Camera className="h-12 w-12 text-primary mb-5" />
                <h3 className="text-xl font-semibold mb-3">Snap Your Receipt</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Take a photo or upload an image. Our AI extracts every line
                  item, quantity, and price automatically.
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                2
              </div>
              <div className="p-8 rounded-2xl border bg-card/80 glass hover-lift h-full">
                <Users className="h-12 w-12 text-primary mb-5" />
                <h3 className="text-xl font-semibold mb-3">Tag Your Group</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Select your Splitwise group. Each member picks exactly what
                  they ordered — fair and transparent.
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                3
              </div>
              <div className="p-8 rounded-2xl border bg-card/80 glass hover-lift h-full">
                <Zap className="h-12 w-12 text-primary mb-5" />
                <h3 className="text-xl font-semibold mb-3">Split Instantly</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We calculate per-person totals and post directly to Splitwise.
                  Everyone pays only for what they had.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Snap & Go — Mobile App Teaser */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl border bg-card/80 glass overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

            <div className="relative grid md:grid-cols-2 gap-8 p-8 md:p-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <Smartphone className="h-4 w-4" />
                  Coming Soon
                </div>
                <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                  <span className="text-gradient">Snap & Go</span>
                  <br />
                  <span className="text-foreground">Mobile App</span>
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Split expenses on the go. Open the app, snap a photo of your
                  receipt, and let AI handle the rest — right from your pocket.
                </p>
                <ul className="space-y-3">
                  {[
                    "Instant receipt scanning with your camera",
                    "Real-time group sync via Splitwise",
                    "Offline support — scan now, split later",
                    "Push notifications for split requests",
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-muted-foreground">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" size="lg" className="gap-2" disabled>
                  <Smartphone className="h-5 w-5" />
                  Notify Me at Launch
                </Button>
              </div>

              <div className="flex justify-center">
                <div className="relative">
                  {/* Phone mockup */}
                  <div className="w-64 h-[500px] rounded-[3rem] border-4 border-foreground/20 bg-card shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-foreground/20 rounded-b-2xl" />
                    <div className="p-6 pt-10 h-full flex flex-col items-center justify-center space-y-4">
                      <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center animate-float">
                        <Camera className="h-10 w-10 text-primary" />
                      </div>
                      <div className="text-center space-y-2">
                        <p className="font-bold text-lg">Splitmate</p>
                        <p className="text-xs text-muted-foreground">Snap & Go</p>
                      </div>
                      <div className="w-full space-y-2 mt-4">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="h-8 rounded-lg bg-muted/30 animate-pulse"
                            style={{ animationDelay: `${i * 200}ms`, width: `${100 - i * 15}%` }}
                          />
                        ))}
                      </div>
                      <div className="w-full mt-auto">
                        <div className="h-10 rounded-xl bg-primary/30 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">Split Now</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Glow behind phone */}
                  <div className="absolute inset-0 -z-10 bg-primary/20 blur-3xl rounded-full scale-75" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Powered by <span className="text-gradient">Intelligence</span>
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            Advanced AI that understands receipts like a human
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: "AI Receipt Parsing",
                desc: "AWS Textract + LLM pipeline extracts line items, quantities, and prices from any receipt format.",
              },
              {
                icon: ScanLine,
                title: "OCR Accuracy",
                desc: "Handles crumpled, faded, and handwritten receipts with multi-pass AI correction.",
              },
              {
                icon: Zap,
                title: "Instant Processing",
                desc: "Receipts are parsed in seconds, not minutes. Upload and split before the meal is over.",
              },
              {
                icon: Users,
                title: "Splitwise Sync",
                desc: "Directly integrates with Splitwise. Finalized splits post to your group automatically.",
              },
              {
                icon: Shield,
                title: "Secure & Private",
                desc: "Your data is encrypted in transit and at rest. Receipts are processed and not stored permanently.",
              },
              {
                icon: Receipt,
                title: "Item-Level Splits",
                desc: "Each person selects exactly what they ordered. No more unfair even splits.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="p-6 rounded-2xl border bg-card/80 glass hover-lift"
              >
                <div className="p-2 rounded-xl bg-primary/10 w-fit mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold">
            Ready to <span className="text-gradient">Split Smarter</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Join{" "}
            {stats ? (
              <span className="text-foreground font-semibold">
                {stats.totalUsers.toLocaleString()}+
              </span>
            ) : (
              "thousands of"
            )}{" "}
            users who have ditched manual math for AI-powered receipt splitting.
          </p>
          <Button size="lg" className="text-lg px-10 py-6 gap-2 animate-pulse-glow" asChild>
            <Link href={`${BASE_API_URL}/login/auth`}>
              Start Splitting for Free
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground/60">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Free Forever
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> No Ads
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Open Source
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Receipt className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">Splitmate</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            AI Powered Itemized Expense Splitter
          </p>
        </div>
      </footer>
    </main>
  );
}
