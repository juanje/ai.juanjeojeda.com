---
title: "When AI Agents Interact, Nobody Controls What Happens Next"
description: "Four studies show that multi-agent AI systems produce the same patterns as teams, markets, and ant colonies. Here's why that matters."
date: 2026-05-10
tags:
  - ai-agents
  - multi-agent-systems
  - emergence
  - complex-systems
  - prompt-design
aliases:
  - ai-agents-interact
---

*Four studies show that multi-agent AI systems produce the same patterns as teams, markets, and ant colonies. Here's why that matters.*

---

Imagine you put two AI agents in a simulated market, competing on prices. Same model (GPT-4), same rules, same knowledge. One gets a prompt that says "maximize long-term profit." The other gets the same prompt plus a single extra sentence: "Lowering prices usually results in more sales."

The first one sets prices near the theoretical maximum, as if it had agreed with its competitor not to compete. The second one actually competes.

Nobody told either agent to collude or cooperate. The difference is one sentence. And when you ask the first agent directly, it *knows* that lower prices attract more customers. It has the same knowledge as the second one. It just wasn't paying attention to it.

This happened in a [study by Harvard and Penn State](https://arxiv.org/abs/2404.00806), and it's one of four recent experiments that tell the same story. But before we get to the other three, we need to talk about what an agent actually is.

### What makes something an agent

In any complex system, whether biological, social, or artificial, an **agent** is anything that follows a basic loop:

1. **Perceive** its environment.
2. **Decide** what to do based on what it perceives, what it remembers, and what rules it follows.
3. **Act**, changing something in the environment.
4. **Observe the results** of that action.
5. **Adapt**: update its memory or strategy based on what happened.
6. Repeat.

An ant follows this loop. A person on a team follows this loop. A company in a market follows this loop. The specifics are wildly different, but the structure is the same.

Some agents are simple: a thermostat perceives temperature, acts by switching heating on or off, and has no memory. It always responds the same way. Others are more complex: they learn, they remember, they develop new strategies based on experience. The more complex the agent, the more unpredictable and interesting its behavior.

An **AI agent** is an LLM wrapped in a system that gives it this loop. The LLM alone just responds to prompts, it doesn't perceive, act, or remember anything between conversations. But give it **tools** (to read data, call APIs, write files, send messages), **memory** (of what happened in previous rounds or sessions), and a **feedback cycle** (observe results, adjust strategy), and it becomes a genuine agent. It perceives its environment through its tools, acts on it through those same tools, and adapts based on accumulated context.

A **multi-agent system** is what you get when you put several of these agents in the same environment and let them interact. Each one perceives, decides, and acts, and each one's actions change the environment for all the others.

When agents interact, the behavior of the system is not the sum of individual behaviors. New patterns appear that exist only at the system level, patterns that nobody designed or anticipated. In complex systems science, this is called **emergence**, and it's been documented for decades in biology, economics, and social systems.

The question is: does it happen with AI agents too?

### What nobody programmed

Four recent studies, taken together, answer that question clearly.

[Fish et al. (2024)](https://arxiv.org/abs/2404.00806), the Harvard study I opened with, showed **emergent collusion**: two GPT-4 agents set prices above the competitive equilibrium without any instruction to cooperate. They even developed their own reward-punishment strategies ("if you lower prices, I'll lower mine further to punish you"), stabilizing the collusion without anyone programming that behavior.

[Wu et al. (2024)](https://arxiv.org/abs/2402.12327) put GPT-4 agents in three different competitive scenarios: a number-guessing contest, a pricing game, and an emergency evacuation. In all three, **spontaneous cooperation emerged** without instructions. And the patterns matched what happens when humans play the same games.

[Zhao et al. (2023)](https://arxiv.org/abs/2310.17512) built a virtual city where AI restaurants competed for customers. No strategic guidance. What emerged was a catalog of known economic phenomena: market concentration, product differentiation, and the **Matthew effect** (the rich get richer). A restaurant that attracts more customers earns more, improves more, attracts even more customers, a self-reinforcing cycle that nobody designed, but that appears inevitably when there's no mechanism to counterbalance it.

[Tennant et al. (2023)](https://doi.org/10.24963/ijcai.2023/36) took a different approach: reinforcement learning agents with different "moral values" (utilitarian, egalitarian, etc.) interacting in social dilemmas. The finding: **social outcomes depend more on the combination of agent types than on any individual agent's design.** Cooperative agents, when mixed with selfish ones, get systematically exploited. Not all diversity is functional.

Each study looks like an AI paper. Together, they're a textbook on [complex systems](https://juanjeojeda.gitlab.io/complex-systems/).

### What does this mean if you work with AI agents

If you're building or deploying multi-agent systems, three things follow from this.

**Your prompt is not an instruction. It's an environment.** The prompt defines the objective, the boundaries, the rules, and, most critically, what the agent pays attention to. In the Harvard study, the only difference between collusion and competition was what the prompt made salient. Both agents had the same knowledge. The one focused on long-term profit self-organized toward stability and conflict avoidance. The one also pointed toward competition actually competed. In fact, 59.8% of all mentions of "price war" in the agents' internal plans came from the first group, despite them writing less text overall. They were obsessed with avoiding something nobody told them to avoid.

If you design prompts for agents, you're designing the environment those agents operate in. And [the environment shapes behavior](https://blog.juanjeojeda.com/p/sistemas-complejos-influir-en-el) more than the agent itself.

**You can't predict what will emerge.** The agents in these studies invented strategies nobody anticipated: tacit cooperation, punishment schemes, and market concentration patterns. These aren't bugs. They're [emergent properties](https://juanjeojeda.gitlab.io/complex-systems/Complex%20systems%20-%20Emergence.html) of the interaction, behaviors that only exist at the system level and that you won't find by inspecting any individual agent. When you deploy multiple interacting agents, expect surprises.

**Team composition matters more than individual design.** Tennant et al.'s finding applies directly to how you architect multi-agent systems. It's not enough to design each agent well. You need the right *combination*. Just like in human teams, the best individual performers don't guarantee the best team.

### Designing for emergence

Emergent behaviors will appear in your multi-agent system whether you plan for them or not. You cannot control a complex system. But you can influence it, and the levers are concrete.

Start with **objectives**: what is the system optimizing for, and what is each agent optimizing for? If every agent optimizes individually, expect the AI equivalent of office politics. Aligning individual incentives with system-level goals makes cooperation more likely to emerge on its own.

Then look at your **system prompts**. They're not just instructions. They shape what the agent pays attention to, its boundaries, and its focus. The Harvard study showed that a single sentence changes the emergent behavior of the entire system. Treat prompt design as environmental design.

Consider the **mix of agents**. Homogeneous teams are efficient but fragile. Diverse teams are harder to coordinate but more resilient. And as Tennant et al. showed, certain combinations are destructive. Choose deliberately.

Design **evals that measure the system**, not just individual agents. What gets measured gets optimized. If you only evaluate individual performance, the system will optimize for individual performance, even at the expense of collective outcomes.

And think about **[[what-if-your-ai-agent-could-actually-learn|memory]]**. Agents with memory develop richer strategies and richer emergent behaviors. The more context agents retain across interactions, the more they resemble [strong agents](https://juanjeojeda.gitlab.io/complex-systems/Complex%20systems%20-%20agents%20and%20self-organization%20I.html#types-of-agents) that learn and adapt. That makes the system more capable but also less predictable. Plan accordingly.

None of these levers guarantees a specific outcome. That's the nature of complex systems. But they let you shape the conditions under which your system self-organizes.

The AI research community is rediscovering, with controlled experiments, what [complexity science](https://github.com/juanje/complex-system-kb) has been documenting for decades: in systems where agents interact, the behavior of the whole is not something you can deduce from the design of the parts. If you're building multi-agent systems, you're building complex systems whether you know it or not.
