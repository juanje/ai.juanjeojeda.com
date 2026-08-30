---
title: "BDD: Behavior-Driven Development"
description: "A concise explanation of BDD: executable acceptance scenarios that describe system behavior from the user's perspective."
date: 2026-08-30
tags:
  - methodology
  - testing
  - bdd
  - software-development
aliases:
  - behavior-driven-development
---

**Behavior-Driven Development (BDD)** is a development practice that makes expected system behavior concrete before implementation. Its central question is: **what should a user or external system be able to do?**

That behavior is usually expressed as examples in a shared language. A common format is Gherkin:

```gherkin
Scenario: Reject an invalid URL
  Given the URL "not-a-url"
  When I request a short URL
  Then I receive a 400 error with a descriptive message
```

The scenario is not merely documentation. When connected to executable step definitions, it becomes an acceptance test: a check that the system behaves as its users need it to behave.

BDD works at the boundary of the system. It does not decide how validation, storage, or routing should be implemented internally. It defines the observable outcome that those internal choices must produce.

Gherkin is widely used because it is readable, structured, and supports tags that connect scenarios to requirements. It is not the only possible BDD format. In [[outside-in-development|Outside-In Development]], however, Gherkin is the chosen acceptance format so that behavior stays explicit and traceable.

BDD complements [[tdd|Test-Driven Development]]. BDD asks whether the whole system meets an acceptance scenario; TDD builds the smaller units of logic required to make that scenario pass.
