"""Reproducible grader for RFP Task Type D samples.

Two scorers run against a built-and-served frontend application:

* an agent-as-a-verifier that drives the running app through the natural-language
  outcomes in ``agent_verifier.json`` (deterministic Playwright realization), and
* an LLM-as-a-judge / static analyzer that scores the items in ``rubric.json``.

The must-have rubric items decide the binary pass; nice-to-have items are
reported but not scored. This mirrors the external RFP grader so that a Task
Type D sample can be verified end to end from inside this repository.
"""
