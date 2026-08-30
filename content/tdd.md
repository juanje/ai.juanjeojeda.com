---
title: "TDD: Test-Driven Development"
description: "A concise explanation of TDD: building small units of logic through Red → Green → Refactor cycles."
date: 2026-08-30
tags:
  - methodology
  - testing
  - tdd
  - software-development
aliases:
  - test-driven-development
---

**Test-Driven Development (TDD)** is a development practice in which you write a test for a small piece of behavior before writing the code that implements it.

Its basic cycle is deliberately short:

1. **Red:** write a test that fails.
2. **Green:** write the minimum code needed to make it pass.
3. **Refactor:** improve the design while keeping the test suite green.

For example, before implementing a URL shortener, you might write a unit test stating that a generated code must contain between six and eight URL-safe characters. The missing function makes the test fail; the minimum implementation makes it pass; refactoring then removes duplication or clarifies the design without changing behavior.

TDD works inside the system. It helps define and verify units of logic, but it does not by itself establish that the finished system solves the user's problem. A suite of perfectly tested functions can still implement the wrong feature.

That is why TDD complements [[bdd|Behavior-Driven Development]]. BDD defines the acceptance behavior visible from outside the system; TDD develops the internal logic needed to satisfy it. In [[outside-in-development|Outside-In Development]], BDD is the outer loop and TDD is the inner loop.
