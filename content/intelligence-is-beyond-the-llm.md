---
title: "Intelligence Is Beyond the LLM"
description: "If what makes a system intelligent is its capacity to adapt, then an LLM on its own is not particularly intelligent. What gives it flexibility is everything that happens around it."
date: 2026-08-18
tags:
  - ai-agents
  - complex-systems
  - memory
  - harness
  - emergence
aliases:
  - intelligence-beyond-llm
---

*If what makes a system intelligent is its capacity to adapt, then an LLM on its own is not particularly intelligent. What gives it flexibility is everything that happens around it.*

> También disponible en [español](https://ia.juanjeojeda.com/la-inteligencia-esta-mas-alla-del-llm).

---

People tend to confuse what an LLM is with what a chatbot is (ChatGPT, Claude, Gemini...), but the model and the software that wraps it and makes it useful to the user are two different things.

If you call the model directly through its API and ask the same question several times, even if you say or ask other things in between, you'll get a very similar answer each time. But if you do it through a chatbot, the answer will change. Especially if between one time and the next you give it more context about your question or correct something.

The reason is that the LLM retains no memory between calls. Every time you ask it something, it starts from zero. It doesn't know you and has no idea what you've said before. A chatbot, though, saves the conversation and passes it back in with every call, so the model starts with a temporary "memory" of what you've discussed and appears to pick up where you left off.

This works up to a point. That temporary "memory" (the so-called *context window*) has a limit. And conversations are saved per session or chat. That's why, when you open a new chat, the model doesn't "remember" anything or continue where you left off. Some chatbots are already building longer-term memories to store things about you across conversations, but that also happens in the software layer, not in the model.

So that feeling that the chatbot adapts to you, that it can follow a thread or even change its mind, emerges from the interaction between the LLM and that software layer, with those stored "memories" and the prior conversation being fed back in. It's not something the model does on its own.

And this is where it gets interesting.

> Neuroscientist [Suzana Herculano-Houzel](https://www.suzanaherculanohouzel.com/) defines intelligence as **behavioral flexibility**: the capacity of an organism to modify its behavior based on past experiences but also on the **anticipation of future states** that hold value for the individual.

That definition reframes the question. If what makes a system intelligent isn't raw power but its capacity to adapt its behavior, then an LLM on its own is not particularly intelligent. It always responds from the same state. What gives it flexibility is everything that happens around it.

## The model doesn't operate alone

What chatbots do is just the beginning. Around the model you can add much more than conversation history: persistent memory, tools, identity, feedback loops, and a working environment. That's what we call the *harness*.
The harness is what turns the model into part of an agent (whether it's a coding assistant, a marketing automation, or anything else).

> An agent is a process that lives in a loop, has a goal, a way to get information from its environment, has tools to interact with it, and reflects on the results it gets. The harness is what gives the agent those tools, [[what-if-your-ai-agent-could-actually-learn|memory]], and connection to the environment.

An isolated LLM responds based on its weights and whatever context you feed it in each call. An agent can retain information across sessions, consult documents, act on the environment, observe the result, and try again. That sequence changes its state and modifies what it can do next. It's not that the model becomes more intelligent. It's that the complete system develops capabilities that didn't exist in the model alone.

## Memory doesn't have to live inside

We tend to think of memory as something that lives inside a brain, or inside a model. But it doesn't always work that way.

Consider the slime mold (*Physarum polycephalum*). An organism with no brain and no nervous system that solves mazes. How? It leaves chemical traces in its environment that modify its own subsequent behavior. The traces change the decision landscape, not the organism. The system uses those marks to avoid previously explored paths and preserve the most useful ones. Memory is distributed between the organism and the environment.

Something similar happens in an AI agent. Memory can live in the conversation history, in a file, in a tool's output, or in a rule that the system has consolidated after several experiences. It doesn't have to be inside the LLM to modify its behavior. Files change the context, not the model, just like the slime mold's chemical traces change the landscape, not the cells.

I've seen this firsthand building the memory system for [Buddy](https://github.com/juanje/buddy), an agent I've been developing as an open-source project for months. Without memory, the agent only reacts to the immediate present. With memory, it can compare what's happening now with what happened before, adjust its behavior, and accumulate a history that changes its available options. The difference isn't one of power. It's accumulated context.

## Trajectory creates state

In complex systems, history matters. Two systems that start out nearly identical can diverge if they go through a different sequence of interactions.

Think of two identical agents that receive the same question. One has just read a technical document and received a correction from the user. The other starts cold. The answer will be different, and not just because of the model's non-determinism, but because each one has built a different context. The trajectory has created a different state, and state modifies the space of possible responses.

I see this with [Buddy](https://github.com/juanje/buddy). I run two instances: one for work and one for personal things. They started with the same structure, but after weeks of use they've developed different memories, rules, and priorities. Not because I planned it that way, but because each one has lived a different history. The divergence isn't a bug. It's the system adapting to its context of use.

## Context as a landscape of possibilities

We usually treat context as a package of information we hand to the model: the more information, the better the answer. But context also works as a constraint: it makes some possibilities more visible and pushes others out of focus.

This difference shows up when you compare how an agent's knowledge can be organized. You can feed it loose fragments retrieved by similarity (what a conventional RAG does), and the agent receives potentially useful pieces but disconnected from their original context. It's like someone highlighting paragraphs from different books and putting them in front of you without their original context.

What I use in Buddy works differently. The agent starts with a lightweight index, follows a pointer, reads a full document, and continues navigating through its connections when it needs to. Like opening a Wikipedia page and following its links. The path traveled helps build meaning, because the architecture of the context determines which concepts appear together and which relationships the agent can detect.

Designing the context isn't just choosing what information to give it. It's shaping the landscape of possibilities from which it responds.

## Design the conditions, not the outcome

If capability emerges from the complete system, building agents isn't just about picking a more powerful model.

In my experience, what has changed my agent's usefulness the most hasn't been LLM upgrades. It's been deciding:
- What memory the system keeps and what it discards.
- How it accesses that memory (navigation, not dumping).
- What tools expand its action space.
- What feedback it receives after acting.
- What constraints shape its trajectory.
- What deterministic tasks can be handled by code, instead of *hoping* the LLM remembers to do them.

When the agent navigates its files, it's not reading a passive store. It's using them as part of its thinking process. The external context modifies what it can connect, what it can recall, and what actions it can consider. The agent doesn't think with the model alone. It thinks with the model, the files, the tools, and the environment it operates in.

It's worth noting that this doesn't guarantee a specific outcome. We're talking about complex systems, not recipes. But it does change the space of what's possible. And in practice, that shows.

Next time you evaluate an agent, don't just look at what model it uses. Ask yourself what it remembers, how it navigates, what tools it can use, and how it changes after interacting with the world.

The question isn't just how to make a smarter model. It's how to design a system that allows it to develop more flexible behavior.
