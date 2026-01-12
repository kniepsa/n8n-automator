# ADR-005: Joe Gebbia UX Critique

## Status

Acknowledged (2026-01-12)

## Context

A brutal, honest critique of n8n-automator using Joe Gebbia's Airbnb design framework. The goal: challenge every assumption and identify fatal flaws before investing more time.

---

## The Brutal Inquisition

### Question 1: "Who exactly is this for?"

**The facetious attack:** "Non-technical person using self-hosted n8n" - that's an oxymoron. Self-hosting requires:

- Setting up a server/Docker
- Managing environment variables
- SSL certificates
- Port forwarding
- Database configuration

A truly non-technical person doesn't self-host anything. They use cloud services. Your target audience is a unicorn that doesn't exist.

**My honest answer:** This is the fatal flaw. The intersection of "non-technical" + "self-hosted n8n" is tiny. Real self-hosters are:

- DevOps people (technical → they'd use Claude Code + MCP directly)
- Cost-conscious startups (semi-technical → same)
- Privacy-paranoid orgs (have IT staff → technical)

**The hard truth:** Your actual TAM is ~5,000-10,000 users max. And most of them can already use Claude.

---

### Question 2: "Why wouldn't I just use Claude Desktop + n8n MCP?"

**The facetious attack:** I can install Claude Desktop, add the n8n MCP server, and type "create a workflow that sends Slack messages when..." - I get the SAME result. Why would I pay for your wrapper?

**My honest answer:** Right now, you're right. The current product is literally Claude + n8n MCP with a UI wrapper. A technical person gains nothing.

**What's missing for differentiation:**

- Pre-built credential detection (Claude doesn't know what I've connected)
- Visual preview before deploy (Claude outputs JSON)
- Workflow library/community
- Version history / rollback
- Monitoring & error alerts
- Non-technical onboarding (credential setup wizard)

---

### Question 3: "What's the 10-second wow moment?"

**The facetious attack:** I land on your site. What happens in 10 seconds that makes me say "holy shit, I need this"?

Current flow:

1. Sign up (friction)
2. Connect n8n instance (friction)
3. Type a goal (where's the magic?)
4. Wait for AI to analyze (loading...)
5. Pick tools (more work for me)
6. Check credentials (more friction)
7. Finally chat (finally!)
8. Deploy (one more step)

That's **8 steps before value**. Airbnb's 10-star experience was: "You arrive, the door opens, you're home." Not "You arrive, fill out 3 forms, verify your ID..."

**My honest answer:** There's no instant gratification. No "try without signing up." No demo mode. No "here's a workflow we already built for you."

---

### Question 4: "Why would someone come BACK?"

**The facetious attack:** I built one workflow. Why do I return tomorrow? Next week? Next month?

- Is there a community showing cool workflows? No
- Do I get notifications when my workflows fail? No
- Can I see analytics on my automations? No
- Is there a streak/gamification? No
- Do I get suggested improvements? No

This is a **one-time tool**, not a habit-forming product.

**My honest answer:** Retention is zero. Once someone builds their 3 workflows, they're done. There's no ongoing value.

---

### Question 5: "What about Bolt/Lovable/Cursor?"

**The facetious attack:** These tools can generate entire apps. Why would I use your tool just for n8n workflows when I can ask Bolt to "build me an automation" and it handles everything?

**My honest answer:** Generalist AI tools are getting better at specialized tasks every month. Your moat is evaporating in real-time. By the time you launch, Claude will probably have better n8n support natively.

---

### Question 6: "Show me the money"

**The facetious attack:** What's the business model?

- Free? You burn money on Claude API costs
- Subscription? For what ongoing value?
- Per-workflow? $.50 per workflow = $150 lifetime value on a power user
- Enterprise? They have IT staff who can use Claude directly

**My honest answer:** The pricing model isn't defensible because the core value (AI + n8n) is available for free via Claude Desktop.

---

## The Concierge Test

Joe Gebbia asks: **"Would you personally show up at this customer's house and do this for them?"**

If I showed up at a self-hosted n8n user's house:

1. First I'd **set up their credentials** (OAuth flows, API keys - this is hard)
2. Then I'd **understand their business** (what actually needs automating?)
3. Then I'd **build 5-10 workflows for them** (not one)
4. Then I'd **teach them to modify** (not just deploy)
5. Then I'd **set up monitoring** (so they know when things break)

Your current product only does step 3. **You're missing 80% of the concierge experience.**

---

## The Fix: A Defensible USP

Given all this, here's what would make n8n-automator actually valuable:

### Option A: "The n8n Concierge for Non-Technical Teams"

Pivot away from "build workflows" to **"n8n setup & management for teams without DevOps"**:

1. **Done-for-you n8n hosting** (Railway template, one-click)
2. **Credential setup wizard** (OAuth flows with hand-holding)
3. **Pre-built workflow library** (not just templates, actual working workflows)
4. **Monitoring dashboard** (workflow failures, alerts)
5. **Managed upgrades** (n8n version updates)

**USP:** "n8n without the DevOps. We host, configure, and maintain. You just automate."

**Pricing:** $49/mo (vs n8n Cloud $24/mo for the convenience)

---

### Option B: "The n8n Workflow Marketplace"

Stop building the AI builder (others will copy it) and build **distribution**:

1. **Workflow marketplace** (buy/sell n8n workflows)
2. **One-click install** (like WordPress plugins)
3. **Revenue share** with creators
4. **Workflow certification** ("This workflow is production-tested")

**USP:** "Don't build workflows. Buy proven ones."

**Business model:** 30% cut of workflow sales (like App Store)

---

### Option C: Double Down on "Non-Technical" with Radical Simplicity

If you insist on the current direction, make it **truly non-technical**:

1. **No self-hosting required** - Partner with Railway for one-click n8n instances
2. **Zero setup** - Demo mode with sample credentials (sandbox n8n)
3. **3 clicks to value** - Landing page → Pick use case → See working demo
4. **Templates only** - Kill custom chat, just do templates with customization
5. **White-glove onboarding** - Calendly link for free 15-min setup call

**USP:** "n8n automations for people who don't know what n8n is."

---

## Recommendation

**Option A** (n8n Concierge) is the strongest because:

1. **Real pain point** - Managing self-hosted software is hard
2. **Recurring revenue** - Monthly hosting + maintenance
3. **Moat** - Operational expertise, not just AI
4. **Defensible** - Can't be replicated by Claude alone
5. **Clear upgrade path** - Start with templates, graduate to custom
6. **Actual non-technical users** - Because YOU handle the technical parts

---

## Decision

**For now:** Continue with current chat-first approach, ship N8n Nerd Process, validate with real users.

**Future:** Revisit Option A (Concierge) pivot based on user feedback and retention metrics.

---

## Next Steps to Make This Bulletproof

1. **Validate the pivot** - Interview 10 n8n users. Ask: "What's harder - building workflows or managing n8n?"
2. **Build a landing page for Option A** - See if people sign up
3. **Prototype hosting** - Railway template + this UI = full package
4. **Kill features ruthlessly** - Custom chat is not the USP, simplicity is

---

## Related

- ARCHITECTURE.md (Future Direction comment)
- ADR-003: Goal-First Flow
- ADR-004: N8n Nerd Process
