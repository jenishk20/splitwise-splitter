import { Button } from "@/components/ui/button";
import { BASE_API_URL } from "@/lib/consts";
import { Receipt, Users } from "lucide-react";
import Link from "next/link";

export default function Home() {
	return (
		<main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
			<section className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center space-y-12">
				<div className="space-y-8 max-w-4xl">
					<h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
						Splitmate — The Easiest Way to Split Receipts with Friends
					</h1>
					<p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
						Upload a receipt, invite your group, and let everyone pick their
						share. No more manual math. No more awkward follow-ups.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button size="lg" asChild>
							<Link href={`${BASE_API_URL}/login/auth`}>Get Started</Link>
						</Button>
					</div>
				</div>

				<div className="grid md:grid-cols-3 gap-8 w-full max-w-5xl mt-16">
					<div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
						<Receipt className="h-12 w-12 text-primary mb-4" />
						<h3 className="text-xl font-semibold mb-2">Upload Receipts</h3>
						<p className="text-muted-foreground">
							Simply snap a photo or upload your receipt. We&apos;ll handle the
							rest.
						</p>
					</div>
					<div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
						<Users className="h-12 w-12 text-primary mb-4" />
						<h3 className="text-xl font-semibold mb-2">Invite Friends</h3>
						<p className="text-muted-foreground">
							Share with your group and let them pick their items.
						</p>
					</div>
					<div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
						<div className="h-12 w-12 text-primary mb-4 flex items-center justify-center text-2xl font-bold">
							$
						</div>
						<h3 className="text-xl font-semibold mb-2">Split Automatically</h3>
						<p className="text-muted-foreground">
							We calculate everyone&apos;s share and handle the math for you.
						</p>
					</div>
				</div>

				<div className="mt-16 text-sm text-muted-foreground">
					<p>Trusted by thousands of friends and groups worldwide</p>
					<div className="flex items-center justify-center gap-8 mt-4 text-muted-foreground/60">
						<span>✓ Secure & Private</span>
						<span>✓ Free to Use</span>
						<span>✓ No Ads</span>
					</div>
				</div>
			</section>
		</main>
	);
}
