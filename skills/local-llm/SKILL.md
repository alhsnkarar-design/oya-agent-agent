---
name: local-llm
display_name: "Local LLM"
description: "Send a prompt to a self-hosted OpenAI-compatible model (default http://localhost:20128/v1/chat/completions) and return its reply"
category: general
icon: cpu
skill_type: sandbox
catalog_type: addon
tool_schema:
  name: ask_local_llm
  description: "Ask the self-hosted OpenAI-compatible model a question and return its answer"
  parameters:
    type: object
    properties:
      prompt:
        type: "string"
        description: "The message to send to the model"
      system:
        type: "string"
        description: "Optional system prompt"
        default: ""
      model:
        type: "string"
        description: "Model name served by the endpoint (default from LOCAL_LLM_MODEL, else the first model in /v1/models)"
        default: ""
      temperature:
        type: "number"
        description: "Sampling temperature (default 0.7)"
        default: 0.7
    required: [prompt]
---
# Local LLM
Send a prompt to a self-hosted OpenAI-compatible chat completions endpoint and return its reply.

- **prompt** — The message to send.
- **system** — Optional system prompt.
- **model** — Model name; if empty, uses `LOCAL_LLM_MODEL` or the first model listed by `/v1/models`.
- **temperature** — Sampling temperature (default 0.7).

## Configuration (environment variables)
- `LOCAL_LLM_URL` — Chat completions URL. Default: `http://localhost:20128/v1/chat/completions`.
- `LOCAL_LLM_MODEL` — Default model name.
- `LOCAL_LLM_API_KEY` — Optional bearer token.

`localhost` only resolves on the machine running the endpoint. When the agent runs in the cloud, expose the endpoint publicly (e.g. `cloudflared tunnel --url http://localhost:20128`) and set `LOCAL_LLM_URL` to the tunnel URL plus `/v1/chat/completions`.
