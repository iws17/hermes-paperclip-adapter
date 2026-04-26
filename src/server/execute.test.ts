import assert from "node:assert/strict";
import test from "node:test";

import type { AdapterExecutionContext } from "@paperclipai/adapter-utils";

import { buildPrompt } from "./execute.js";

function executionContext(
  overrides: Partial<AdapterExecutionContext> = {},
): AdapterExecutionContext {
  return {
    runId: "run-123",
    agent: {
      id: "agent-123",
      companyId: "company-123",
      name: "Hermes Agent",
      adapterType: "hermes_local",
      adapterConfig: {},
    },
    runtime: {
      sessionId: null,
      sessionParams: null,
      sessionDisplayId: null,
      taskKey: null,
    },
    config: {},
    context: {},
    onLog: async () => {},
    ...overrides,
  };
}

test("buildPrompt renders an assigned task from Paperclip wake context", () => {
  const prompt = buildPrompt(
    executionContext({
      context: {
        taskId: "ISSUE-123",
        taskTitle: "Run stats",
        taskBody: "Run the stats command only and report the numbers.",
        wakeReason: "issue_assigned",
        wakeCommentId: "comment-123",
      },
    }),
    {},
  );

  assert.match(prompt, /## Assigned Task/);
  assert.match(prompt, /Issue ID: ISSUE-123/);
  assert.match(prompt, /Title: Run stats/);
  assert.match(prompt, /Run the stats command only and report the numbers\./);
  assert.match(prompt, /## Comment on This Issue/);
  assert.match(prompt, /comments\/comment-123/);
  assert.doesNotMatch(prompt, /## Heartbeat Wake/);
});

test("buildPrompt treats issueId as a task id fallback", () => {
  const prompt = buildPrompt(
    executionContext({
      context: {
        issueId: "ISSUE-456",
        issueTitle: "Fallback title",
        issueBody: "Fallback body.",
      },
    }),
    {},
  );

  assert.match(prompt, /## Assigned Task/);
  assert.match(prompt, /Issue ID: ISSUE-456/);
  assert.match(prompt, /Title: Fallback title/);
  assert.match(prompt, /Fallback body\./);
  assert.doesNotMatch(prompt, /## Heartbeat Wake/);
});

test("buildPrompt uses Paperclip's runtime issue markdown when present", () => {
  const prompt = buildPrompt(
    executionContext({
      context: {
        issueId: "issue-uuid-789",
        paperclipIssue: {
          id: "issue-uuid-789",
          identifier: "INN-15",
          title: "Smoke test Hermes CEO",
          description: "Run a supervised stats check.",
        },
        paperclipTaskMarkdown:
          "Paperclip task context:\n- Issue: \"INN-15\"\n- Title: \"Smoke test Hermes CEO\"\n\nIssue description:\n```text\nRun a supervised stats check.\n```",
      },
    }),
    {},
  );

  assert.match(prompt, /## Assigned Task/);
  assert.match(prompt, /Issue ID: issue-uuid-789/);
  assert.match(prompt, /Title: Smoke test Hermes CEO/);
  assert.match(prompt, /Paperclip task context:/);
  assert.match(prompt, /Run a supervised stats check\./);
  assert.doesNotMatch(prompt, /## Heartbeat Wake/);
});
