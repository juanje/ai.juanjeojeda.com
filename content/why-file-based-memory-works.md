---
title: Why File-Based Memory Works
description: "The ideas behind giving AI agents memory are showing up everywhere. Here's why they work and where they come from."
date: 2026-04-12
tags:
  - ai-agents
  - memory
  - file-based-memory
  - progressive-disclosure
  - convergent-evolution
  - CoALA
  - learning
aliases:
  - why-file-based-memory
---

*The ideas behind giving AI agents memory are showing up everywhere. Here's why they work and where they come from.*

---

> A heads-up: this article is more technical than the first one. If you read [[what-if-your-ai-agent-could-actually-learn|the first article]] and wondered _where these ideas come from_ or _why this particular shape keeps working_, this is the article for those questions.

Something interesting is happening in AI agent development right now, and it's happening from multiple directions at once.

When I published [[what-if-your-ai-agent-could-actually-learn|the first article]] about giving AI agents persistent memory using Markdown files, I was describing a personal experiment. I had built [Agentic Buddy](https://github.com/juanje/agentic-buddy), an open-source system where a local AI agent keeps its memory in plain files, learns from experience through maintenance cycles, and uses progressive disclosure to manage what it loads into context. It works. I use it daily.

I come from two worlds that don't usually talk to each other. By day, I'm a software engineer at Red Hat. On the side, I've spent years studying [complex systems](https://blog.juanjeojeda.com/), neuroscience, and cognitive science, trying to understand how we learn and what makes adaptive systems work. When I started experimenting with AI agents, I naturally brought those ideas with me. The piece that pulled it all together was an Anthropic engineering article from September 2025: ["Effective context engineering for AI agents"](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents), where I first saw **progressive disclosure** described as a deliberate engineering pattern: organizing the files an agent reads so that it only loads what it needs at each step. The idea clicked immediately, and it explained later how [Skills](https://agentskills.io/what-are-skills) (another Anthropic pattern) work. Both rest on the same principle: keep the entry point small, let depth emerge from navigation.

But when I sat down to write the first article and went looking for specifics, I found more than I expected. The same architecture (file-based memory with a lightweight index, topic files loaded on demand, periodic consolidation cycles, identity files for behavioral consistency) was showing up independently in academic research, in production frameworks, and in tools built by the companies that train the models themselves.

## The framework that already existed

Before diving into specific implementations, it helps to know that there's already an academic framework that describes exactly what we're talking about.

**CoALA** (Cognitive Architectures for Language Agents), published in 2024 by Sumers, Yao, Narasimhan, and Griffiths ([arXiv:2309.02427](https://arxiv.org/abs/2309.02427)), draws on cognitive science to organize language agents along three dimensions: memory, action space, and decision-making. For memory, it distinguishes **working memory** (what's loaded right now) from **long-term memory**, and divides long-term memory into three types from cognitive psychology: **semantic** (facts and concepts), **episodic** (past experiences), and **procedural** (instructions, skills, how-to knowledge).

This maps directly to what file-based memory systems do. Working memory is your lightweight index file loaded at startup. Semantic memory is your curated knowledge files. Episodic memory is your daily logs. Procedural memory is your identity files and skills. CoALA didn't invent these categories — they come from decades of cognitive science — but it formalized the connection between human memory types and agent architecture.

Why does this matter? Because [LangChain](https://www.langchain.com/) cites CoALA explicitly in its documentation. When multiple independent systems use the same vocabulary (working memory, episodic memory, procedural memory, consolidation), that's not a coincidence. There's a shared theoretical foundation, and CoALA is where it's codified.

A broader survey published in late 2025 by Hu, Liu, Yue et al. ([arXiv:2512.13564](https://arxiv.org/abs/2512.13564)), from a consortium of universities including NUS, Renmin, Fudan, Peking, and Oxford, maps the entire landscape of memory in LLM-based agents. It classifies approaches by **form** (token-level, parametric, latent), **function** (factual, experiential, working), and **dynamics** (formation, evolution, retrieval). File-based memory falls squarely into **token-level memory**, which the survey describes as "the most common memory form and the one with the largest body of existing work." Not exotic. Mainstream.

The survey also notes that the boundary between agent memory and RAG is increasingly blurred, and that what defines agent memory is a "persistent, evolving cognitive state that integrates factual knowledge and experience." That's a precise description of what a well-maintained Markdown memory directory does.

## Why it works (the technical reasons)

The question isn't really "can you store memories in files?" Of course you can. The question is: why does this particular arrangement, lightweight index plus on-demand topic files plus periodic consolidation, produce consistently good results?

Three specific findings from recent research explain this.

**Context position matters more than context size.** This is the empirical foundation for progressive disclosure, and it's exactly what Anthropic's "[Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)" describes when it argues that agents should "maintain only what's necessary in working memory" and "incrementally discover relevant context through exploration." The article frames this as a deliberate engineering pattern: lightweight identifiers up front, just-in-time retrieval at runtime, and structured note-taking for persistence. It's a clean articulation of the same architecture that file-based memory systems implement.

The empirical justification comes from Liu et al. (2024, "[Lost in the Middle](https://arxiv.org/abs/2307.03172)"), who showed that LLMs systematically underuse information placed in the middle of their context window. Performance follows a U-shaped curve: models are good at using information at the very beginning or end, and much worse in the middle. This isn't a bug that will be fixed with larger windows. It's a property of how attention works. The practical consequence is direct. If you load everything the agent might need at session start, most of it lands in the middle of the context, exactly where the model is worst at using it. Progressive disclosure sidesteps this: the working memory file is small enough to stay at the top of the context. Everything else arrives fresh, on demand, in response to an immediate need. The agent uses the part of the context it's best at using.

**Without consolidation, memory degrades instead of improving.** Park et al. (2023, "[Generative Agents](https://arxiv.org/abs/2304.03442)") built the famous "Smallville" experiment where 25 LLM-driven agents exhibited believable social behavior over long time horizons. The key architectural insight was that agents need a **memory pipeline**, not just a memory store. Raw observations must be periodically synthesized into higher-level reflections, or the agent drowns in its own logs. Their ablation study showed that removing the reflection mechanism broke long-term behavioral coherence.

This is exactly what maintenance cycles do. Without periodic consolidation (call it daily review, weekly calibration, or, as Anthropic does, "dreaming"), an agent's memory store accumulates noise: contradictory entries, stale debugging notes, relative dates that lose meaning. The notebook that was supposed to help the agent remember instead confuses it. Consolidation is not optional maintenance. It's where the actual learning happens.

**Natural-language principles reliably shape model behavior.** Bai et al. (2022, "[Constitutional AI](https://arxiv.org/abs/2212.08073)") demonstrated that a small set of natural-language principles can reliably control how a model behaves. Claude itself was trained this way. The implication for file-based memory is that identity files (a `SOUL.md` or equivalent) aren't just nice-to-have. A well-written set of principles loaded at session start doesn't just change how the agent *sounds*. It changes how it *decides*. Without it, the agent may remember facts, but its character drifts from session to session.

## Industry convergence

The same architecture that emerged from research and experimentation is showing up in production systems, independently, from multiple teams.

### LangChain Deep Agents

LangChain's [Deep Agents framework](https://docs.langchain.com/oss/python/deepagents/memory) implements file-based memory as a first-class feature. The documentation reads like a technical specification of the same ideas:

- Memory files like `AGENTS.md` loaded at session start.
- Skills "loaded on demand rather than injected into every prompt, keeping context lean until a capability is needed." That's progressive disclosure.
- Background consolidation, which they call "sleep time compute": a separate agent reviews recent conversations, extracts key facts, and merges them with existing memories. Triggers can be cron-based or activity-based.
- The same CoALA taxonomy (semantic, episodic, procedural memory) is cited explicitly.

The most important thing Deep Agents brings to the table isn't the memory system itself, it's the [pluggable backends](https://docs.langchain.com/oss/python/deepagents/backends). The agent always sees a filesystem (`ls`, `read_file`, `write_file`, `grep`), but behind that interface, the actual storage can be anything: local files on disk, an in-memory state, a LangGraph Store backed by Redis or Postgres, S3, or any custom database. Combined with namespacing by user, agent, or organization, this means the file-based mental model scales to any deployment size.

This dissolves the most common objection to file-based memory: "it doesn't scale." The objection assumes "files" means literal files on disk. Once you separate the interface (a filesystem the agent reads and writes) from the implementation (whatever storage layer you want), the limitation disappears. The agent thinks in files. The infrastructure decides what those files actually are.

### Claude Code: Auto Memory and Auto Dream

Anthropic itself has built file-based memory into Claude Code, the company's own coding agent. [Auto Memory](https://code.claude.com/docs/en/memory#auto-memory), available since v2.1.59 and documented officially, gives Claude the ability to write its own notes about your project across sessions. The architecture follows the same pattern: a `MEMORY.md` file acts as a concise index loaded at the start of every session (capped at 200 lines or 25KB), and topic files like `debugging.md` or `api-conventions.md` are "not loaded at startup. Claude reads them on demand using its standard file tools when it needs the information." Plain markdown, editable, on disk. The agent decides what's worth remembering based on whether the information would be useful in a future conversation.

There's also a more recent feature called **Auto Dream** that handles consolidation between sessions. It isn't in the official documentation yet, but multiple independent sources have confirmed its existence and described its mechanics in detail. It's modeled explicitly on REM sleep: a background process reviews what Auto Memory has collected, resolves contradictions, converts relative dates to absolute ones, removes stale entries, and reorganizes the memory directory. The process triggers when both 24 hours have passed and more than 5 sessions have occurred since the last consolidation.

What makes this particularly relevant is that it comes from the people who understand best how their model behaves with respect to context and attention. They had every option available, including the more elaborate ones, and they chose this. Same shape as everyone else: lightweight index, on-demand topic files, periodic consolidation. The fact that the simplest viable architecture keeps being the one chosen, by independent teams with different constraints, is a stronger signal than any single implementation.

### The broader convergence

It's not just LangChain and Claude Code. Yaohua Chen documented this pattern in a [DEV Community article](https://dev.to/imaginex/ai-agent-memory-management-when-markdown-files-are-all-you-need-5ekk), calling it "convergent evolution": multiple independent projects arriving at the same solution because it's the right answer to a shared problem.

- **OpenClaw** uses a dual-layer Markdown architecture with `MEMORY.md`, daily log files, and `SOUL.md` for personality, and popularized the identity-file pattern.
- **Manus**, a Singapore-based AI agent startup [acquired by Meta for over $2 billion](https://www.cnbc.com/2025/12/30/meta-acquires-singapore-ai-agent-firm-manus-china-butterfly-effect-monicai.html) in late 2025, reportedly used a three-file pattern (`task_plan.md`, `notes.md`, deliverable) for long-running agents.
- **Andrej Karpathy** articulated an adjacent idea in his [gist on LLM-maintained knowledge wikis](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f): replacing traditional RAG with a Markdown wiki that the LLM itself maintains, because LLMs handle bookkeeping effortlessly.

When this many independent teams arrive at the same architecture, there must be something to it.

## Why it works (the deeper reasons)

The technical explanations above tell you *what* works. But there's a deeper question: *why* does this particular shape keep emerging?

I think the answer connects to something broader than AI engineering. It connects to how learning works in complex systems generally.

The file-based memory pattern succeeds because it respects a few principles that show up everywhere adaptive systems learn:

**Start simple, let structure emerge.** This is a core insight from complex systems theory. Sophisticated behavior doesn't require sophisticated design. It requires the right simple rules and an environment that allows structure to emerge from use. The file-based approach does exactly this: you start with a minimal directory structure, a few empty files, and some instructions. The agent's "brain" organizes itself as it works. What I found, and what I think others are finding too, is that the structure that emerges from actual use is more efficient than anything you'd design on paper.

**Alternate between exploration and consolidation.** Every adaptive system, biological or artificial, navigates uncertainty by alternating between two modes: exploring (trying new things, varying approaches) and exploiting (applying what works). The file-based memory architecture embeds this alternation directly. During a session, the agent explores: it works on problems, encounters new situations, writes observations. Between sessions, the consolidation cycles exploit: they extract what's useful, discard what isn't, and organize what remains. Neither mode works alone. Exploration without consolidation produces a growing pile of noise. Consolidation without exploration produces a static, brittle knowledge base.

**Forgetting is a feature, not a limitation.** In neuroscience, forgetting isn't a failure of memory. It's a mechanism that keeps the system functional. Without forgetting, every memory has equal weight, and the signal-to-noise ratio degrades until the system can't find anything useful. The same applies to agent memory. Files that haven't been accessed in weeks are taking up space in the agent's "attention" without contributing anything. Archiving them isn't losing knowledge, it's maintaining the system's ability to find what actually matters. Importance isn't declared. It emerges from use.

## One step further: dreaming as practice

I want to close with an idea that I think points to where this could go next.

The current consolidation cycles, whether Agentic Buddy's maintenance commands, Deep Agents' background consolidation, or Claude Code's Auto Dream, are housekeeping. They review, prune, merge, reorganize. That's valuable, but it's only half of what the brain does during sleep.

The other half is more interesting. During REM sleep, the brain doesn't just file memories. It **replays the day's experiences in varied configurations**. It takes the problems you encountered and runs them again, but with different contexts, different orderings, combinations that never actually occurred during the day. Neuroscience calls this *offline replay*. The result isn't just cleaner memories. It's the extraction of **abstract patterns** that transfer to situations you haven't seen yet. Generalization through variation.

Nikolai Bernstein, a Soviet physiologist who studied how humans learn to move, captured this idea decades ago with a concept he called **"repetition without repetition."** He found that master craftsmen (he studied blacksmiths) never strike the hammer the same way twice, but they always hit the same spot. Novices try to repeat the exact same movement and miss. Mastery isn't about perfecting a fixed technique. It's about solving the same problem through different paths until the underlying skill becomes flexible enough to handle whatever the context throws at you.

In Bernstein's terms, the difference is between a **technique** (a fixed solution for a specific context) and a **skill** (the capacity to generate the right technique on the fly for whatever context you're facing right now).

I think agent memory systems could take a step in this direction. Imagine a consolidation cycle that doesn't just clean up memories, but **re-solves problems the agent encountered during the day**, with slightly different contexts, maybe with higher temperature, maybe with constraints removed or added. Not just reviewing what happened, but practicing variations of it. Exploring alternative paths to the same objectives. Building the kind of flexible, transferable skills that come from Bernstein's "repetition without repetition," not from memorizing solutions.

This is how [strong agents](https://juanjeojeda.gitlab.io/complex-systems/Complex%20systems%20-%20agents%20and%20self-organization%20I.html#types-of-agents) learn in complex adaptive systems. They don't just accumulate knowledge. They develop flexible, dynamic skills that adapt to changing contexts. The current memory systems are the foundation. The next step is turning sleep from housekeeping into practice.
