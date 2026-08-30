---
title: What If Your AI Agent Could Actually Learn?
description: "Most AI agents start every session from scratch. What if yours could remember past decisions, build on previous work, and forget what's no longer relevant?"
date: 2026-04-10
tags:
  - ai-agents
  - memory
  - file-based-memory
  - progressive-disclosure
  - learning
  - agentic-buddy
socialImage: og-images/what-if-ai-agents-could-learn.png
aliases:
  - adding-memory-to-local-agents
---

*On giving local agents memory, identity, and the ability to forget.*

---

I've spent years researching how we learn. Not in a lab, more like a slow, personal deep-dive into neuroscience, cognitive psychology, [complex systems theory](https://blog.juanjeojeda.com/), and how all of that connects to practical things like skill acquisition, habit change, and expertise. It's a genuine obsession. And over the past year, as I started working more seriously with AI agents (using them daily for work or building experimental projects like [macsdk](https://github.com/juanje/macsdk), [Mystery agents](https://github.com/juanje/mystery-agents), and other), a question kept nagging me: **could any of these ideas about human learning be applied to make agents better?**

Not "smarter model" better. That's Anthropic's and OpenAI's problem. I mean better in a more fundamental way: **could we make agents that actually learn from experience?** That accumulate useful knowledge the way we do, keeping what matters, connecting related ideas, letting go of what's no longer relevant, and developing new skills over time.

I've been exploring this by building an open-source system called [Agentic Buddy](https://github.com/juanje/agentic-buddy), a general-purpose personal assistant with persistent, file-based memory. It lives in its own repo (directory) and helps me with all sorts of things: task management, research, writing, tracking personal projects. It's my testing ground for understanding what works and what doesn't when you try to make an agent learn, and for developing principles that can then be applied to other kinds of agents.

I want to share what I've found, because I think the current generation of AI agents, remarkably capable but amnesic and unable to learn anything new between sessions, can be pushed much further than most people realize.

### The brilliant colleague with amnesia

If you've used an LLM-based agent for coding, research, writing, or just thinking through a problem, you know the pattern. You start a conversation, load some context, do your work, close the session. Tomorrow, you start fresh.

It's like having a brilliant colleague with amnesia. Every morning, you walk in and they've forgotten everything. Your project. Your decisions. The mistake you both agreed to avoid. Gone.

The smarter tools let you write a static instruction file that gets loaded at every session start. That helps. But it's still a fixed document that you maintain manually. It doesn't learn. It doesn't grow. It doesn't adapt.

The real bottleneck isn't model capability, current models are remarkably good. The bottleneck is **context**: the agent doesn't know what matters _right now_, what was already decided, what keeps going wrong, or what you learned last week.

And here's the thing: even if context windows keep growing, more context doesn't mean better context. An agent with 200K tokens of raw history is worse than one with 2K tokens of the right information at the right time.

What you need isn't a bigger memory. It's a smarter one.

### Files as the memory substrate

The first idea is almost embarrassingly simple: **use the filesystem as the agent's brain.**

No databases. No vector stores. No embeddings. No external APIs. Just [Markdown](https://en.wikipedia.org/wiki/Markdown) files in a Git repo.

And I mean _just_ files. The entire implementation is a set of directories and Markdown documents, there is no code. You point a coding assistant like [Claude Code](https://claude.ai/code/family) or [Cursor](https://cursor.com/) at the directory, and the instruction files turn that assistant into an agent with persistent memory that learns over time. The "magic" is all in how the files are structured and how the agent is instructed to use them.

This works because today's AI coding assistants are, at their core, agents that are very good at reading and writing text files. That's their native capability. And it turns out that reading and writing files is all you need to create memories, develop new skills, and consult previously learned knowledge. The filesystem becomes the agent's brain, and the agent's existing file manipulation abilities become the mechanism for learning.

Why files? Because they're readable by both humans and agents. They're versionable, Git gives you full history for free. They're portable, no server, no migration, no vendor lock-in. And they're composable: you can link, split, merge, and reorganize them as the system evolves.

[Andrej Karpathy](https://karpathy.ai/) recently [proposed something along these lines](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f): replacing traditional [RAG](https://en.wikipedia.org/wiki/Retrieval-augmented_generation) with an LLM-maintained Markdown wiki, pointing out that the tedious part of maintaining a knowledge base is the bookkeeping, and LLMs handle bookkeeping effortlessly. It's a sharp insight.

But I think the idea can be taken further. A knowledge wiki is one piece of the puzzle. What if the agent also had _memory_, a structured sense of what happened, what was decided, what patterns keep recurring? And what if it could _learn from its own experience_, actively curating its knowledge, promoting what's useful, and letting go of what isn't?

### Progressive disclosure: the key that makes it work

If you dumped all the agent's knowledge into its context window at the start of every session, the system would collapse. Context windows are finite and expensive. But more importantly, most of the knowledge simply isn't relevant to what you're doing right now.

**Progressive disclosure** solves this. The agent starts each session by loading a single lightweight file (~100 lines). That file contains just enough to orient it: who you are (briefly), what's happening right now, and, critically, **pointers to where everything else lives.** The agent doesn't load everything. It knows _where to look_ for everything.

During the conversation, when a topic comes up that requires deeper knowledge, the agent follows the relevant pointer and reads that specific file. Each knowledge file contains its own links to related files, so the agent can keep drilling deeper as needed. Think of it as navigating a well-organized wiki: you start at the table of contents, go to the section you need, and follow cross-references from there. You never need to read the whole thing.

This is where the system diverges from traditional RAG. In a RAG pipeline, the system embeds your query, searches a vector database, and retrieves the most similar chunks of text, often fragments stripped of their original context. The model then has to reconstruct meaning from isolated pieces. With progressive disclosure, when the agent reads a file, it gets a **coherent document with context**: summary, key points, examples, and links to related concepts. And the agent arrived at that file through a chain of contextual links, so it already has the surrounding context that explains _why_ this information is relevant.

For curated knowledge at moderate scale (dozens to low hundreds of files), this structured navigation gives results that consistently surprise me, often better than what I'd expect from a heavier retrieval system, precisely because the context is preserved and coherent.

### Four types of memory

Not all information is the same. A decision made yesterday, a concept learned last month, and a draft you're working on right now serve very different purposes and need very different lifecycle rules.

The architecture uses four memory zones, each with a distinct function:

```
 ┌───────────────────────────────────────────────────────┐
 │                    AGENT MEMORY                       │
 │                                                       │
 │  ┌──────────────┐  Always loaded. ~100 lines.         │
 │  │   Working    │  Current state + pointers to the    │
 │  │   Memory     │  rest. The agent's active attention.│
 │  └──────┬──▲────┘                                     │
 │    load │  │ promote / demote                         │
 │  on use │  │ based on usage                           │
 │  ┌──────▼──┴────┐                                     │
 │  │   Semantic   │  Concepts, skills, projects.        │
 │  │   Memory     │  Long-term knowledge.               │
 │  │              │  Hebbian: used → stays,             │
 │  │              │           unused → archived.        │
 │  └──────▲───────┘                                     │
 │         │ distill                                     │
 │  ┌──────┴───────┐                                     │
 │  │   Episodic   │  Daily logs.                        │
 │  │   Memory     │  Decisions, context, lessons.       │
 │  │              │  Raw → structured → distilled.      │
 │  └──────────────┘                                     │
 ├───────────────────────────────────────────────────────┤
 │  ┌──────────────┐                                     │
 │  │  Extended    │  User workspace.                    │
 │  │    Mind      │  Drafts, lists, documents.          │
 │  │              │  Agent assists; user owns.          │
 │  └──────────────┘                                     │
 └───────────────────────────────────────────────────────┘
```

**Working memory** is the only thing loaded automatically, the lightweight file with who you are, what's happening now, and pointers to deeper knowledge. This is also where the agent's **identity** lives: two files loaded at every session start that give the agent consistency across interactions.

One defines the agent's character (SOUL.md): how it should behave, what it values, how it communicates, what it should push back on. It's more like a personality specification that shapes judgment calls, not just responses. The other (USER.md) captures who you are: your role, your preferences, your current context. The agent updates this organically as it learns about you, flagging anything inferred rather than directly stated so you can correct it. This pattern of file-based identity was pioneered by [OpenClaw](https://docs.openclaw.ai/concepts/agent#bootstrap-files-injected), and the idea is gaining traction because it's transparent, editable, and versionable. Without it, the agent may remember facts but won't feel consistent, helpful one day, generic the next.

**Semantic memory** is long-term knowledge: concepts the agent has learned, patterns it has noticed, projects it's tracking, skills it has developed. Each file tracks when it was last accessed and how often, metadata that drives what gets promoted closer to working memory and what gets archived.

**Episodic memory** is the raw log of what happened, daily conversation records that get distilled into semantic memory during maintenance cycles.

**Extended mind** is the user's workspace. Documents, drafts, boards, things the agent can read and contribute to, but never reorganizes on its own.

The analogy to human memory is deliberate and turns out to be more than just a metaphor. The different lifecycle rules for each zone (working memory refreshed daily, semantic knowledge curated by usage, episodic logs compacted over time, user space untouched) mirror how our own memory systems handle different types of information. It's a genuinely useful design heuristic.

### Learning through maintenance cycles

This is the part that takes the system from "memory" to "learning."

The agent learns through a pipeline of increasingly deep maintenance cycles:

```
 Conversations
       │
       ▼
  ┌──────────┐    /reflect
  │ Episodic │◄───────────────  Extract decisions, lessons,
  │  Memory  │                  observations into daily log
  └────┬─────┘
       │  /daily
       │  Consolidate: convert repeated
       │  observations into knowledge
       ▼
  ┌───────────┐
  │ Semantic  │  /weekly
  │  Memory   │──────────────►  Calibrate: are the right
  └────┬──────┘                 files in working memory?
       │                        Generalize across patterns.
       │  promote relevant
       ▼                        /monthly
  ┌──────────┐                ┌───────────────────────────┐
  │ Working  │◄───────────────│ Archive unused knowledge. │
  │  Memory  │                │ Detect contradictions.    │
  └──────────┘                │ Prune stale skills.       │
                              └───────────────────────────┘
```

**Reflect** processes the current conversation, extracting decisions, tasks, ideas, and lessons into today's log. It also detects _observations_: patterns that might become knowledge. Think of it as journaling.

**Daily consolidation** reviews the day's logs, creates new concepts from repeated patterns, forms links between existing knowledge, and updates working memory with what's currently relevant.

**Weekly review** steps back: what got done, what's stuck, are the right files in working memory? It calibrates, generalizes across patterns, and catches structural issues.

**Monthly maintenance** does the deep work: archive old logs, prune knowledge that hasn't been accessed, detect contradictions, review the overall structure.

Each cycle operates at a different time scale, and each builds on the previous one. The same principle as spaced repetition in learning: frequent shallow reviews catch what's important fast; infrequent deep reviews catch structural patterns that only become visible over time.

**The maintenance cycles aren't just cleanup. They're where the actual learning happens.** The daily cycle converts observations into knowledge. The weekly cycle generalizes. The monthly cycle prunes and detects contradictions. Without them, you just have a growing pile of notes. With them, you have a knowledge base that actively curates itself.

In my current implementation, these cycles are triggered manually (slash commands in the editor). That's a deliberate choice: I want the system to work across different local agents and editors, and most don't support reliable automation hooks yet. But there's nothing fundamental about the manual trigger. These cycles are designed for automation, and when they run on their own, the memory becomes dramatically more powerful: the agent maintains itself, and you just use it.

### From noise to knowledge

There's a specific mechanism worth calling out. The agent keeps an observation journal, things it has noticed but hasn't acted on. _"The user always checks CI status first thing."_ _"This error pattern keeps appearing in the auth service."_

A single observation is noise. When the same observation appears twice, that's a signal. The maintenance cycle can then convert it into a **skill** (_a reusable procedure_), a **rule** (_a behavioral guideline_), or a **concept** (_a piece of knowledge_).

Learning is conservative by design. No jumping to conclusions from a single data point. The exception is direct corrections: if you tell the agent "don't do that," it proposes a rule immediately, because **your direct feedback is the strongest signal there is**.

### Forgetting is not a bug, it's a feature

Here's something that took me a while to appreciate: **controlled forgetting is not a limitation. It's what makes the system scale.**

Every knowledge file tracks metadata:

```yaml
---
last_accessed: 2026-04-09
access_count: 12
created: 2026-03-15
---
```

Files consulted frequently get promoted to working memory. Files untouched for 30+ days with few accesses get archived during monthly maintenance.

This is directly inspired by Hebbian plasticity in neuroscience: "neurons that fire together wire together." Files that are _used_ stay prominent. Files that aren't, fade. Importance isn't declared, it emerges from use.

And the Hebbian mechanism works in both directions. The maintenance cycles don't just archive unused files, they also **promote frequently used knowledge closer to the agent's starting context.** Files the agent consults often get referenced directly from the working memory file, making them one step away instead of two or three. The system's structure naturally adapts so that the most useful knowledge is the most accessible.

Without this, the knowledge base grows without bound, signal-to-noise degrades, and the agent wastes context on information that stopped being relevant weeks ago. Forgetting is what keeps the system useful over time.

(Archived files aren't deleted. They move to an archive directory, and Git preserves everything. More like moving boxes to the attic than throwing them away.)

### Beyond the personal assistant

Agentic Buddy is a personal assistant, my testing ground for understanding these principles in practice. But the principles themselves are general. What I care about isn't the specific tool I built, but the ideas behind it: structured file-based memory, progressive disclosure, maintenance cycles that convert experience into knowledge, identity files for consistency, and controlled forgetting. These are design patterns, and they can be applied to very different kinds of agents.

A few examples of where I think this could go:

- **Team knowledge and onboarding.** An agent that learns how a specific team works from ongoing interactions, not from a static wiki. It observes recurring decisions, common patterns, established conventions. When a new team member asks _"Why did we choose this approach?"_, the agent knows because it was there when those decisions were made, and its maintenance cycles have distilled the important patterns from the noise.
- **Infrastructure and incident learning.** A living knowledge base of failure patterns and resolutions that evolves as the infrastructure evolves. When a similar issue appears, the agent has context about what worked last time, what didn't, and what changed since then.
- **Codebase knowledge.** An agent that learns a specific codebase, not just the code, but the reasoning behind it. Why was this module structured this way? What trade-offs were considered? This kind of tacit knowledge usually lives only in people's heads and gets lost when they leave the team.

These are just starting points. In all cases, the same design patterns apply.

### Why I think this matters

We're at a point where AI agents are useful but fundamentally limited by their lack of persistent context. The models are capable. What's missing is the memory infrastructure around them.

The most common approaches to fixing this are either "throw everything into a giant context window" (expensive, noisy, doesn't scale) or "build a complex RAG pipeline" (powerful, but heavyweight and opaque). I think there's a middle path, **structured files with progressive disclosure and lifecycle management**, that's simpler, more transparent, and good enough for a surprising range of use cases.

But the bigger point is this: as AI agents become a routine part of how we work, the question of _what they remember, how they learn, and how they forget_ is going to become a first-class engineering problem. Not just for companies building AI products, but for every team that uses an AI assistant. The agents that know your context, your team's patterns, your codebase's history, your infrastructure's failure modes, will be dramatically more useful than the ones that start fresh every session.

If you want to experiment with these ideas, [Agentic Buddy](https://github.com/juanje/agentic-buddy) is open source and takes about five minutes to set up. It's a personal assistant, not a coding-project plugin, but the patterns you learn from using it can inform how you'd build memory into other kinds of agents.

My own takeaway from all of this is that the intelligence of current AI doesn't live only in the models. An agent, like any complex agent in a complex environment, can develop memory and skills from surprisingly simple rules and a basic way to interact with its surroundings. In this case, the filesystem.

We tend to overcomplicate things when we try to design the perfect system upfront. I did exactly that at the beginning: I over-engineered the file structure I thought the agent would need, wrote strict rules for every edge case, and tried to anticipate every scenario. It didn't work very well. What finally worked was the opposite: a minimal structure, fewer and simpler rules, and letting the system organize its own "brain" as use demanded. The structure that emerged from actual use turned out to be more efficient, and more useful, than anything I had designed on paper.

That's the part I didn't expect. I came into this thinking I was designing a memory system. I ended up watching one grow.
