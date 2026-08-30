---
title: "Outside-In Development: Spec → BDD → TDD for AI Coding Agents"
description: Without a verifiable contract, AI coding agents build the wrong thing, skip testing, over-engineer, and never know when to stop. Outside-In development addresses this.
date: 2026-08-29
tags:
  - ai-agents
  - coding-agents
  - methodology
  - bdd
  - tdd
  - testing
aliases:
  - spec-bdd-tdd
---

**Without a verifiable contract, AI coding agents build the wrong thing, skip testing, over-engineer, and never know when to stop. Outside-In development addresses this.**

---

AI coding agents generate code fast — until you look at what they actually built. In my experience, without structure, they tend to fail in four predictable ways:

- **They build the wrong thing.** The agent interprets a vague prompt, produces something that looks right but isn't what was needed. You discover this after reviewing hundreds of lines of generated code.
- **They don't verify their work.** Code is generated but never meaningfully tested. "Looks correct" replaces "is correct."
- **They over-engineer.** The agent adds abstractions, patterns, and features nobody asked for. A simple CLI becomes a plugin architecture with dependency injection.
- **They don't know when to stop.** No clear completion criterion. The agent either stops too early (missing edge cases) or keeps iterating endlessly (polishing code that already works).

These aren't occasional glitches. They share a root cause: the agent has no verifiable contract defining what "done" looks like.

I arrived at this structure after repeatedly finding that an agent could produce plausible code while leaving me unable to tell whether the feature was actually complete.

Outside-In development addresses this. It combines [[bdd|BDD]] (Behavior-Driven Development: executable acceptance scenarios that describe what the system must do from the user's perspective) and [[tdd|TDD]] (Test-Driven Development: small Red → Green → Refactor cycles that build the logic behind that behavior) into a two-loop cycle where the agent always knows what to build, how to verify it, and when it's finished.

## How it works

Two phases:
1. **Design** (once, upfront)
2. **Implementation** (repeating cycle per feature).

### Phase 1: Design

**This is the phase where human judgment matters most**. You research the problem, brainstorm the approach, and produce the project's knowledge base. These are the artifacts the agent reads to understand what to build. The quality of these artifacts determines whether the agent builds the right thing — get them wrong, and the rest of the methodology enforces the wrong spec with precision. Three documents:

**SPEC.md** — What and why. A catalog of functional requirements (FRs) and non-functional requirements (NFRs), each with a unique ID. Every FR has a short title and a description of what it does and why it matters. Crucially, **no acceptance criteria** — those live exclusively in `.feature` files. The spec defines intent; Gherkin defines verifiable behavior.

**DOMAIN.md** — Domain context the agent can't discover from code alone. Glossary, real examples, data formats, edge cases, external system behavior. Essential for non-trivial domains; for simple projects, this can be a section in SPEC.md.

**DECISIONS.md** — Architectural rationale. Each entry captures the context, options considered, the decision made, and its consequences. This prevents the agent from revisiting settled questions or making incompatible choices.

#### When is Design done?

Not every FR needs to be fully defined upfront. Design is ready when the artifacts answer six questions:

1. **What is the goal?** The project's purpose and end state.
2. **What is the MVP?** The minimal feature set — with its quality attributes — that makes the project genuinely usable. A feature without its behavioral constraints is a prototype, not an MVP.
3. **What is this project *not*?** Explicit scope boundaries.
4. **What rules apply across all features?** NFRs and design principles that shape every implementation decision: error handling, safety defaults, idempotency.
5. **What does the domain look like?** Enough context to write correct scenarios.
6. **What stack and tools?** Language, frameworks, test runners, quality checks.

FRs beyond the MVP can be added incrementally — the spec is a living document. But the MVP features, the cross-cutting NFRs, and the scope boundaries must be solid before implementation starts.

### Phase 2: Implementation

For each feature, strictly in order:

```
1. Select FR         Pick the next FR from the spec.
       ↓
2. BDD (Red)         Write .feature file(s) with Gherkin scenarios.
                     Write step definitions with real assertions.
                     Run the BDD runner → confirm RED.
       ↓
3. TDD (Red)         Write a failing unit test for the first
                     piece of logic needed.
       ↓
4. TDD (Green)       Write the MINIMUM code to pass the test.
       ↓
5. Refactor          Simplify if needed. Tests stay green.
       ↓
6. Inner loop        Repeat 3–5 until the BDD scenario passes.
       ↓
7. Outer loop        Repeat 2–6 until all scenarios for the FR pass.
       ↓
8. Quality gate      Run ALL checks: format, lint, type check,
                     unit tests, BDD tests, coverage. Every check
                     is PASS/FAIL. All pass → commit.
       ↓
9. Next feature      Pick the next FR.
```

Two loops, both test-first:

- **Outer loop (BDD):** one iteration per acceptance scenario. Defines *what* the system should do from the user's perspective.
- **Inner loop (TDD):** one iteration per unit of logic. Defines *how* each piece works internally.

The outer loop drives the inner loop. You write a BDD scenario that fails, then use TDD cycles to build the implementation until the scenario passes. Then the next scenario.

## Example: URL shortener

Let's walk through the cycle with a concrete example.

### Design artifacts

**SPEC.md** (excerpt):

```markdown
## Functional Requirements

### FR-SHORTEN-01: Shorten a URL

Given a valid URL, the system generates a unique short code
and returns the shortened URL. The short code must be URL-safe
and between 6–8 characters.

### FR-SHORTEN-02: Redirect to original URL

Given a valid short code, the system redirects the client
to the original URL with an HTTP 301 response.

### FR-SHORTEN-03: Reject invalid URLs

The system must validate that the input is a well-formed URL
with an HTTP or HTTPS scheme. Invalid inputs return a 400 error
with a descriptive message.

## Non-Functional Requirements

### NFR-01: Idempotency

Shortening the same URL twice must return the same short code,
not create a duplicate entry.

### NFR-02: Short code collision

If a generated short code collides with an existing one,
the system must regenerate automatically — never return
a duplicate or fail silently.
```

Notice: FRs describe *what* and *why*, not *how to verify*. No Given/When/Then here.

### Implementation cycle

**Step 1: Select FR.** We pick `FR-SHORTEN-01`.

**Step 2: BDD (Red).** Write the `.feature` file:

```gherkin
# features/shorten.feature

@FR-SHORTEN-01
Feature: Shorten a URL

  Scenario: Shorten a valid URL
    Given the URL "https://example.com/very/long/path"
    When I request a short URL
    Then I receive a short URL containing a code of 6 to 8 characters
    And the short URL base is "http://localhost:8000"

  @NFR-01
  Scenario: Shortening the same URL twice returns the same code
    Given the URL "https://example.com/same-url"
    When I request a short URL
    And I request a short URL again for "https://example.com/same-url"
    Then both responses return the same short code
```

Then write step definitions with **real assertions** — not stubs, not "pending" markers:

```python
# features/steps/shorten_steps.py

from behave import given, when, then
import requests

@given('the URL "{url}"')
def step_given_url(context, url):
    context.url = url

@when('I request a short URL')
def step_request_short_url(context):
    response = requests.post(
        "http://localhost:8000/shorten",
        json={"url": context.url}
    )
    context.response = response
    context.short_url = response.json().get("short_url", "")

@then('I receive a short URL containing a code of {min:d} to {max:d} characters')
def step_check_code_length(context, min, max):
    code = context.short_url.split("/")[-1]
    assert min <= len(code) <= max, f"Code '{code}' length not in [{min}, {max}]"
```

Run `behave` → **RED**. The server doesn't exist yet, so the step definitions execute and the scenario fails with a connection error. This is Red — not "undefined," not "pending." The scenario is executable and fails against an interface that doesn't exist yet. (See the principle below on why the distinction matters.)

**Steps 3–6: TDD inner loop.** Now build the implementation test-first:

```python
# tests/test_shortener.py

def test_generate_short_code_length():
    code = generate_short_code("https://example.com/path")
    assert 6 <= len(code) <= 8

def test_generate_short_code_is_url_safe():
    code = generate_short_code("https://example.com/path")
    assert code.isalnum()

def test_same_url_produces_same_code():
    code1 = generate_short_code("https://example.com/same")
    code2 = generate_short_code("https://example.com/same")
    assert code1 == code2
```

Each test starts RED (the function doesn't exist), then you write the minimum code to make it GREEN, then refactor. Repeat until the BDD scenario passes end-to-end.

**Step 8: Quality gate.** Before committing:

```bash
ruff format --check .    # format    → PASS/FAIL
ruff check .             # lint      → PASS/FAIL
mypy src/                # typecheck → PASS/FAIL
pytest tests/            # unit      → PASS/FAIL
behave                   # BDD       → PASS/FAIL
```

All pass → commit. Any fail → fix before moving on.

**Step 9: Next feature.** Pick `FR-SHORTEN-02` and repeat the cycle.

## Key principles

**Both loops are test-first.** The outer loop (BDD) follows the same Red → Green discipline as the inner loop (TDD). Writing a `.feature` file without executable step definitions is not BDD — it's a wish list.

**"Undefined step" is not Red.** In Outside-In, a scenario where step definitions don't exist yet — or exist as empty stubs marked "pending" — is not in a Red state. Red means the step definitions execute and the scenario fails against an interface that doesn't exist or doesn't behave correctly yet. If the runner reports "undefined" or "pending" instead of a failure, you haven't started the outer loop — you're still in setup.

**BDD and TDD are different layers.** BDD validates acceptance: does the system behave as specified? TDD validates logic: does this unit do its job? They use different runners (`behave`/`cucumber` vs `pytest`/`jest`), test at different granularity, and serve different purposes. They are not interchangeable.

**The quality gate is the definition of done.** A feature is not complete when the agent thinks it works — it's complete when every deterministic check passes. All checks produce binary PASS/FAIL output. This removes interpretation from the "am I done?" question.

**Gherkin is Outside-In's acceptance format.** This methodology requires `.feature` files with Given/When/Then scenarios because Gherkin is structured, parseable, taggable, and supported across major languages. Other BDD practices can use different formats; Outside-In standardizes on Gherkin so that acceptance behavior remains explicit and traceable. The specific runner is still a project choice.

**Not every NFR fits in a scenario.** Some non-functional requirements translate directly into Given/When/Then scenarios: idempotency, input validation, error formats. Others — latency targets, throughput, security hardening — don't. Those belong in the quality gate as dedicated checks (a benchmark script, a security scan, a load test) rather than forced into Gherkin. The methodology requires that every FR has acceptance scenarios; it does not require that every NFR does.

**One feature at a time.** Finish the current feature before starting the next. This prevents half-implemented features and keeps the test suite consistently green.

### When this is overkill

The methodology has a setup cost: spec, domain doc, feature files, progress tracker, quality gate. That cost pays for itself in projects with multiple features, non-trivial domain logic, or ongoing maintenance. It doesn't pay for itself in throwaway scripts, one-shot exploratory prototypes, or tasks where the entire implementation fits in a single file you'll read once and discard. If there's nothing to trace back to a requirement, there's no reason to create one.

## Traceability and progress

Four artifacts linked by FR-IDs:

| Artifact | Contains | Linked by |
|---|---|---|
| SPEC.md | What to build and why | FR-IDs as section headers |
| features/*.feature | How to verify it | `@FR-xxx` tags on scenarios |
| Test suite | How it works internally | Unit tests driven by scenarios |
| progress.json | Where you are in the cycle | FR-IDs as feature identifiers |

Every piece of product behavior should trace back to a scenario. Every scenario traces back to an FR. If product behavior exists without a corresponding scenario, it shouldn't be there. If a scenario exists without a corresponding FR, the spec is incomplete.

### Why track progress explicitly?

AI coding agents don't have persistent memory across sessions. Without an explicit progress file, every session starts with the agent guessing where it left off — scanning code, reading git history, making assumptions. That's the interpretation that produces skipped scenarios, repeated work, or features marked "done" that aren't.

A machine-readable progress file solves this. The agent reads it at session start and knows immediately: which feature is in progress, which cycle step it's on, which scenarios pass and which don't. No guesswork.

A minimal example:

```json
{
  "current_focus": "FR-SHORTEN-01",
  "features": [
    {
      "id": "FR-SHORTEN-01",
      "title": "Shorten a URL",
      "status": "in_progress",
      "cycle_step": "tdd_green",
      "scenarios": [
        { "name": "Shorten a valid URL", "bdd": "fail" },
        { "name": "Same URL returns same code", "bdd": "pending" }
      ]
    },
    {
      "id": "FR-SHORTEN-02",
      "title": "Redirect to original URL",
      "status": "pending"
    }
  ]
}
```

The format matters: **schema-validated JSON, not Markdown.** In practice, Markdown progress files degrade within a few agent sessions — the agent adds context, clarifications, and status commentary until the file is no longer a reliable state record. A schema-validated JSON file constrains that drift: the agent can update known state fields, but adding narrative context requires an explicit schema change.

## Making agents follow the methodology

The methodology is designed to be enforceable by AI coding agents. You don't need special tooling — you need clear instructions in the agent's rules file.

A minimal anchor in your project's agent configuration (CLAUDE.md, .cursorrules, or equivalent):

```
This project follows the Outside-In (Spec → BDD → TDD) methodology.
Read METHODOLOGY.md before any implementation work.
Start every session by checking current progress.
Never write implementation code without a failing test.
Never skip the quality gate before committing.
```

A methodology reference file (like the one this article describes) gives the agent the full procedure. The rules file triggers it; the methodology file defines the steps.

What makes this work:

- **The rules are always loaded** — the agent reads them at session start, every session.
- **The methodology is procedural** — it tells the agent what to do at each step, not just what the goals are. Declarative guidelines ("write tests") get ignored under pressure. Step-by-step procedures ("write a failing test, run it, confirm RED, then write minimum code") are harder to skip.
- **The quality gate catches drift** — even if the agent cuts corners, the gate fails. No interpretation, no judgment, just PASS or FAIL.

The combination of clear instructions, a procedural methodology, and deterministic quality checks creates a self-correcting loop. The agent can still make mistakes, but it can't silently ship them.

## The payoff

- You always know what's been built, whether it works, and what's left.
- The agent always knows what to do next and when to stop.
- Every line of code traces back to a scenario, every scenario to a requirement. If code exists without a test, it's visible.
- Nothing depends on the agent's judgment about completeness. The contract is external, verification is mechanical, and done means tests pass.

---

This article is the methodology reference. A companion tool — a cycle tracker and agent skill that automate progress management and consistency enforcement — is in development. When it ships, it gets its own article.
