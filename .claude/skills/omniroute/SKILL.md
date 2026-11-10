---
name: omniroute
description: Work with an OmniRoute AI gateway (OpenAI-compatible endpoint that routes across many LLM providers with combos, fallbacks, budgets, caching, compression, MCP and A2A). Use when the user mentions OmniRoute, wants to call or configure an OmniRoute server through its REST API or `omniroute` CLI, add providers or API keys, set up routing combos, check usage and costs, or point a tool such as Codex CLI at OmniRoute.
---

# OmniRoute

OmniRoute is a self-hosted AI gateway: one OpenAI-compatible endpoint
(default `http://localhost:20128`, inference under `/v1/...`) in front of
many providers, with routing combos, fallbacks, rate limits, caching,
prompt compression, usage logs, an MCP server and an A2A agent endpoint.

This skill bundles the upstream agent skills from
`cheaper-inference/OmniRoute` (`skills/`, MIT, see `LICENSE`), one file per
area under `references/`. Read only the file the task needs.

## Before you start

1. Find the server. Ask the user for its base URL if it is not
   `http://localhost:20128`, or start one locally with the `omniroute`
   CLI (`references/cli-serve.md`, `references/cli-setup.md`).
2. Authenticate (`references/omni-auth.md`): management/REST calls use
   `Authorization: Bearer <OmniRoute API key>`; the dashboard login uses the
   management password and a session cookie. Never paste keys into chat or
   commit them; read them from an environment variable such as
   `OMNIROUTE_API_KEY`.
3. For plain inference, any OpenAI SDK works with `base_url=<server>/v1`
   (`references/omni-inference.md`). Model names can be a provider model or
   a combo name (`references/omni-combos-routing.md`).

## Where to look

Start points: `omni-auth` for the REST API, `cli-serve` for the CLI.

| File (`references/<id>.md`) | What it covers |
| --- | --- |
| `cli-a2a` | Interact with the OmniRoute A2A server from the CLI. Send tasks, inspect skill execution history, and test the JSON-RPC 2.0 agent-to-agent protocol interactively. |
| `cli-backup-sync` | Backup and restore OmniRoute data from the CLI. Trigger incremental snapshots, sync to cloud storage, manage backup schedules, and restore from archive files. |
| `cli-batches` | Submit and monitor batch inference jobs from the CLI. Upload and manage files for batch processing, retrieve results, and integrate batch pipelines with CI/CD workflows. |
| `cli-chat` | Send chat completions, stream responses, and start an interactive REPL session from the CLI. Supports all OmniRoute providers, combo routing, and system prompt configuration. |
| `cli-compression` | Configure and test prompt compression from the CLI. Manage RTK filters, Caveman rules, stacked compression modes, and preview compression output with real prompts. |
| `cli-contexts` | Manage context engineering configurations, RTK filter sets, and conversation sessions from the CLI. Apply context-relay settings and inspect active context pipelines. |
| `cli-cost-usage` | View cost breakdowns, token usage, and call logs from the CLI. Filter by provider, model, or date range. Export usage reports and inspect per-connection spending. |
| `cli-eval` | Create and run evaluation suites, watch live benchmark progress, view scorecards, compare model performance, and integrate eval runs with CI workflows from the CLI. |
| `cli-health` | Check server health, component status, and live metrics from the CLI. Run `health`, `health components`, and `health watch` for a real-time dashboard of circuit breakers and provider status. |
| `cli-keys` | Create, list, rotate, and revoke OmniRoute API keys from the CLI. Manage OAuth flows for provider authentication and inspect key scopes and expiration. |
| `cli-mcp` | Inspect the MCP server status, list registered tools and scopes, run tool invocations, and manage MCP audit logs from the CLI. |
| `cli-models` | Query available AI models, list model aliases, and browse the full model catalog from the CLI. Filter by provider, search by capability, and resolve model name variants. |
| `cli-plugins-skills` | Manage Omni Skills (list, install, test, remove), plugins (create, configure), and persistent memory (search, add, clear) from the CLI. |
| `cli-policy-audit` | Inspect audit logs, manage access policies, view telemetry data, and review request history from the CLI. Filter by event type, user, or time range for compliance workflows. |
| `cli-providers` | Manage provider connections from the CLI: list available/configured providers, add, test, test-all, validate, rotate API keys, and view per-provider metrics. |
| `cli-resilience` | Inspect and manage circuit-breaker states, connection cooldowns, quota limits, and backoff levels from the CLI. Reset stuck providers and configure resilience thresholds. |
| `cli-routing` | Create, list, update, and delete routing combos from the CLI. Test routing strategies, inspect combo metrics, and configure fallback chains interactively. |
| `cli-serve` | Start, stop, and restart the OmniRoute server from the CLI. Manage daemon mode, port configuration, auto-recovery, system tray integration, and the dashboard open shortcut. |
| `cli-setup` | Run initial setup, configure global CLI settings, manage environment variables, check for updates, and configure autostart via the CLI setup and config commands. |
| `cli-skill-collector` | Detect installed CLI coding tools (Claude Code, Codex, Cursor, Copilot, Cline and more), search GitHub for matching agent skills, and install them to the detected tools via OmniRoute's built-in APIs. |
| `cli-tunnel` | Start and stop tunnel connections (ngrok, Cloudflare, custom) from the CLI. Inspect active tunnel URLs, configure authentication, and test external reachability. |
| `config-codex-cli` | Step-by-step agent workflow to configure the OpenAI Codex CLI on any machine (Linux, macOS, Windows) to use OmniRoute as an OpenAI-compatible backend. Detects OS and shell, writes config.toml and 7 named profiles, sets environment variables, and verifies the setup. |
| `omni-agents-a2a` | Interact with OmniRoute via JSON-RPC 2.0 agent-to-agent protocol. 6 built-in A2A skills: smart-routing, quota-management, provider-discovery, cost-analysis, health-report, list-capabilities. |
| `omni-api-keys` | Create, list, rotate, and revoke OmniRoute API keys. Control per-key scopes, spending limits, and expiration. Keys gate access to all proxy and management endpoints. |
| `omni-auth` | Manage API key authentication and session tokens. Start here to authenticate requests via Bearer token, obtain session cookies, and configure login requirements for the OmniRoute API. |
| `omni-budget` | Configure spending limits, token quotas, and rate-limit policies per API key or globally. Inspect current consumption and enforce cost controls across providers. |
| `omni-cache` | Manage the LLM response cache. View cache statistics, clear entries, configure TTL policies, and control semantic-similarity caching thresholds. |
| `omni-cli-tools` | Manage CLI tool integrations exposed via the API. List, configure, and invoke CLI tool plugins that extend OmniRoute's automation surface. |
| `omni-combos-routing` | Create and manage routing combos with 19 strategies (priority, weighted, round-robin, Auto-combo, and more). Configure fallback chains, test routing outcomes, and retrieve combo metrics. |
| `omni-compression` | Configure RTK (command output), Caveman (prose), and stacked compression modes. Manage language packs, custom rules, and test prompt compression reducing tokens by 60–90%. |
| `omni-context-rtk` | Configure RTK filters, context engineering rules, and context relay settings. Test compression with real prompt samples and manage context transformation pipelines. |
| `omni-db-backups` | Trigger system backups, restore from backup files, and manage the SQLite database lifecycle. Supports export, import, and incremental snapshot strategies. |
| `omni-github-skills` | Search, score, scan, and import agent skills from GitHub repositories that contain SKILL.md, CLAUDE.md, .cursorrules, and similar agent skill files. Discover community skills across many tool and provider categories, evaluate relevance with heuristic scoring, check for malware or hardcoded secrets, and install into Hermes, Claude Code, Gemini CLI, or OpenCode agent directories. |
| `omni-inference` | The core OpenAI-compatible inference endpoints: chat completions, embeddings, images, audio (TTS/STT), moderations, rerank, and the Responses API. The primary integration surface for AI agents. |
| `omni-mcp` | Connect to the OmniRoute MCP server (110 tools, 3 transports: SSE/stdio/HTTP). Covers routing, cache, compression, memory, skills, providers, and audit tools across 33 permission scopes. |
| `omni-models` | Query available AI models across all configured providers. List models, resolve model aliases, and browse the full model catalog including provider-specific variants. |
| `omni-providers` | Manage provider connections, API keys, OAuth flows, and connection tests via the REST API. List, add, update, remove, and test AI provider integrations across OmniRoute's 388-provider catalog. |
| `omni-proxies` | Configure HTTP/HTTPS/SOCKS proxies for upstream provider requests. Set per-provider or global proxy rules, test connectivity, and manage proxy rotation. |
| `omni-resilience` | Monitor provider health, circuit-breaker states, p50/p95/p99 latency metrics, and budget guard alerts. Inspect connection cooldowns and model lockouts in real time. |
| `omni-settings` | Read and update global application settings: system prompts, thinking budget, IP filters, payload rules, combo defaults, and require-login configuration. |
| `omni-sync-cloud` | Synchronise OmniRoute configuration, provider connections, and settings to/from cloud storage. Manage cloud worker authentication and remote backup targets. |
| `omni-tunnels` | Create and manage secure tunnels (ngrok, Cloudflare Tunnel, custom) to expose OmniRoute to the internet or share access with remote agents and CI pipelines. |
| `omni-usage-logs` | Access detailed call logs and usage analytics. Filter by provider, model, time range, status, and cost. Export logs and aggregate token usage across all connections. |
| `omni-version-manager` | Install, start, stop, restart, and update embedded services (9Router, CLIProxyAPI). Monitor service status, retrieve logs, and configure auto-start for local-only service endpoints. |
| `omni-webhooks` | Register, list, test, and remove webhook endpoints. Configure event subscriptions (request.completed, request.failed, quota.exceeded, etc.) and manage delivery retries. |

## Notes

- The reference files are generated upstream; examples assume
  `localhost:20128`. Swap in the real base URL.
- Mutating calls (delete keys, restore backups, reset providers, change
  settings) affect a live gateway: confirm with the user first.
- Source snapshot: cheaper-inference/OmniRoute @ 895c0f3 (2026-11-10).
  To refresh, copy `skills/*/SKILL.md` from that repo into `references/`.
