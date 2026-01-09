import { WaitlistForm } from '@/components/waitlist-form';

export default function Home(): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center rounded-full border border-zinc-700 bg-zinc-900 px-4 py-1.5 text-sm text-zinc-400">
            <span className="mr-2 h-2 w-2 rounded-full bg-green-500" />
            Works with self-hosted n8n
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Build n8n Workflows
            <br />
            <span className="text-zinc-400">Without the Learning Curve</span>
          </h1>

          {/* Subheadline */}
          <p className="mb-10 text-lg text-zinc-400 sm:text-xl">
            Type what you want in plain English. Get a working n8n workflow in seconds.
            <br className="hidden sm:block" />
            Powered by Claude AI + MCP for production-ready automations.
          </p>

          {/* Waitlist Form */}
          <WaitlistForm />

          {/* Social Proof */}
          <p className="mt-6 text-sm text-zinc-500">
            Join 0 others on the waitlist. No spam, ever.
          </p>
        </div>
      </main>

      {/* Pain Points Section */}
      <section className="border-t border-zinc-800 bg-zinc-950 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-2xl font-semibold text-zinc-300">
            Sound familiar?
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <PainPoint
              quote="Staring at a blank n8n canvas feeling frustrated. No idea where to start."
              source="Reddit r/n8n"
            />
            <PainPoint
              quote="The visual builder looks user-friendly. In practice, it requires technical know-how."
              source="Lindy.ai Review"
            />
            <PainPoint
              quote="I have not created 1 working automation in 3 days."
              source="n8n Community Forum"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-zinc-800 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-2xl font-semibold">How it works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Feature
              step="1"
              title="Describe your workflow"
              description="Tell Claude what you want to automate in plain English. No technical jargon needed."
            />
            <Feature
              step="2"
              title="AI builds it for you"
              description="Claude uses MCP to understand n8n's 525+ nodes and creates production-ready workflows."
            />
            <Feature
              step="3"
              title="Deploy to your n8n"
              description="One click to deploy directly to your self-hosted or cloud n8n instance."
            />
          </div>
        </div>
      </section>

      {/* Differentiators */}
      <section className="border-t border-zinc-800 bg-zinc-950 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-2xl font-semibold text-zinc-300">
            Why n8n-automator?
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Differentiator
              title="Claude + MCP (Not GPT)"
              description="Best-in-class AI with direct n8n API access. 1-2 iterations vs 4-5 with other tools."
            />
            <Differentiator
              title="Self-hosted first"
              description="Works with YOUR n8n instance. No cloud lock-in. No credit limits."
            />
            <Differentiator
              title="Architecture, not just generation"
              description="Claude validates your workflow design, not just generates nodes."
            />
            <Differentiator
              title="Team collaboration"
              description="Coming soon: Share workflows, version control, role-based access."
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-zinc-800 px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to automate faster?</h2>
          <p className="mb-8 text-zinc-400">Get early access and 50% off when we launch.</p>
          <WaitlistForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 py-8">
        <div className="mx-auto max-w-4xl text-center text-sm text-zinc-500">
          <p>Built for the n8n community. Not affiliated with n8n GmbH.</p>
        </div>
      </footer>
    </div>
  );
}

function PainPoint({ quote, source }: { quote: string; source: string }): React.ReactElement {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
      <p className="mb-3 text-zinc-300">&ldquo;{quote}&rdquo;</p>
      <p className="text-sm text-zinc-500">— {source}</p>
    </div>
  );
}

function Feature({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}): React.ReactElement {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-lg font-semibold">
        {step}
      </div>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="text-sm text-zinc-400">{description}</p>
    </div>
  );
}

function Differentiator({ title, description }: { title: string; description: string }): React.ReactElement {
  return (
    <div className="rounded-lg border border-zinc-800 p-6">
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="text-sm text-zinc-400">{description}</p>
    </div>
  );
}
