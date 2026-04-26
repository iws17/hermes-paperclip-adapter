import assert from "node:assert/strict";
import test from "node:test";

import { parseModelsFromHermesConfig } from "./index.js";

test("parseModelsFromHermesConfig reads default, custom provider, and explicit model map entries", () => {
  const models = parseModelsFromHermesConfig(`
model:
  default: grok-4.20-0309-reasoning
  provider: xai
providers:
  api.x.ai:
    default_model: grok-4-1-fast-reasoning
custom_providers:
- name: Api.x.ai
  base_url: https://api.x.ai/v1
  model: grok-code-fast-1
  models:
    grok-4.20-0309-reasoning:
      context_length: 2000000
    gpt-5.5:
      context_length: 400000
`);

  assert.deepEqual(
    models.map((model) => model.id),
    [
      "gpt-5.5",
      "grok-4-1-fast-reasoning",
      "grok-4.20-0309-reasoning",
      "grok-code-fast-1",
    ],
  );
});
