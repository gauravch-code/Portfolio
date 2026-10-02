export const projects = [
  {
    id: "winnow",
    name: "Winnow",
    short: "Winnow",
    category: "LOCAL-FIRST AI",
    summary: "Classify locally. Escalate selectively.",
    description:
      "An inbox triage agent that sorts confident mail on CPU, calls a PydanticAI fallback for the ambiguous tail, and learns from corrections through guarded retraining.",
    decision:
      "The LLM is the fallback, not the default. Spend the reasoning budget where uncertainty actually lives.",
    stack:
      "Python / FastAPI / MiniLM / scikit-learn / PydanticAI / Postgres / Next.js",
    repo: "winnow",
    image: "winnow.webp",
    width: 1600,
    height: 1087,
    caption: "A route, a reason, and a correction loop.",
    ready: "Ready to classify.",
    scenarios: [
      {
        name: "Confident email",
        steps: [
          "Encode the email locally",
          "Classify with scikit-learn",
          "Confidence clears the gate",
          "Route without an LLM",
        ],
        result: "Local route accepted. No LLM call needed.",
        branch: 0,
      },
      {
        name: "Ambiguous email",
        steps: [
          "Encode the email locally",
          "Confidence below the gate",
          "Escalate to PydanticAI",
          "Record route and explanation",
        ],
        result: "Uncertain mail took the fallback path.",
        branch: 1,
      },
    ],
  },
  {
    id: "traceguard",
    name: "TraceGuard",
    short: "TraceGuard",
    category: "AGENT OBSERVABILITY",
    summary: "Every step visible. Every draft accountable.",
    description:
      "An operations console for AI agents. It records runs, decisions, and tool calls, exposes the point of failure, and routes uncertain support drafts into a human review queue.",
    decision:
      "An agent output is a draft until the system has enough evidence to release it. Keep the trace and the approval together.",
    stack: "TypeScript / Next.js / OpenAI / Cloudflare Workers / D1 / Drizzle",
    repo: "TraceGuard",
    image: "traceguard.webp",
    width: 1600,
    height: 1250,
    caption: "Inspect the execution, not just the final answer.",
    ready: "Ready to record an agent run.",
    scenarios: [
      {
        name: "Confident support draft",
        steps: [
          "Accept the agent run",
          "Record steps and tool calls",
          "Check the release gate",
          "Keep the trace inspectable",
        ],
        result: "Draft passed the gate. Trace retained.",
        branch: 0,
      },
      {
        name: "Uncertain support draft",
        steps: [
          "Accept the agent run",
          "Record steps and tool calls",
          "Hold the uncertain draft",
          "Queue for human review",
        ],
        result: "Release paused. A human reviews the draft.",
        branch: 1,
      },
    ],
  },
  {
    id: "sre",
    name: "Agentic SRE Pipeline",
    short: "Agentic SRE",
    category: "GUARDED INFRASTRUCTURE",
    summary: "Detect. Investigate. Act within bounds.",
    description:
      "A Go watchdog polls Prometheus. A CrewAI orchestrator gathers incident evidence through four allowlisted MCP tools, then chooses a bounded Kubernetes remediation.",
    decision:
      "Restart on the first alert. Increase the memory limit only when the same problem recurs in the escalation window.",
    stack: "Go / Python / CrewAI / MCP / Kubernetes / Prometheus",
    repo: "Agentic-SRE-Pipeline",
    image: "sre.webp",
    width: 1600,
    height: 1056,
    caption: "A closed remediation loop, with an explicit action policy.",
    ready: "Ready to investigate an alert.",
    scenarios: [
      {
        name: "First memory alert",
        steps: [
          "Watchdog detects the alert",
          "Collect evidence with MCP",
          "First occurrence: restart",
          "Verify the deployment",
        ],
        result: "Restart selected. Memory limit unchanged.",
        branch: 0,
      },
      {
        name: "Repeat memory alert",
        steps: [
          "Watchdog detects recurrence",
          "Check the escalation window",
          "Double the memory limit",
          "Verify the deployment",
        ],
        result: "Recurrence policy escalated the memory limit.",
        branch: 1,
      },
    ],
  },
  {
    id: "toolgen",
    name: "Toolgen",
    short: "Toolgen",
    category: "TOOL-USE TRAINING DATA",
    summary: "Connected tools. Grounded conversations.",
    description:
      "A training-data engine that turns ToolBench schemas into multi-turn tool-use conversations. It samples connected endpoint chains, executes schema-valid mocks with session state, and judges the result.",
    decision:
      "Generate from connected tool schemas, then validate the conversation against the execution. Repair failed samples before accepting them.",
    stack: "Python / Pydantic / NetworkX / OpenAI / LLM-as-judge",
    repo: "toolgen",
    image: "toolgen.webp",
    width: 1600,
    height: 710,
    caption: "Schema-grounded execution before dataset acceptance.",
    ready: "Ready to generate a sample.",
    scenarios: [
      {
        name: "Valid conversation",
        steps: [
          "Sample a connected tool chain",
          "Execute stateful schema mocks",
          "Judge the conversation",
          "Accept the valid sample",
        ],
        result: "Conversation accepted after validation.",
        branch: 0,
      },
      {
        name: "Sample fails validation",
        steps: [
          "Sample a connected tool chain",
          "Execute stateful schema mocks",
          "Judge rejects the sample",
          "Repair and revalidate",
        ],
        result: "Failed sample enters the repair loop.",
        branch: 1,
      },
    ],
  },
];

// Verified via GitHub on 2026-10-01. Runtime discovery replaces this snapshot.
export const contributionSnapshot = [
  {
    repo: "deepset-ai/haystack",
    number: 12863,
    merged: true,
    title: "Treat None metadata as missing in MetaFieldRanker",
  },
  {
    repo: "Tracer-Cloud/opensre",
    number: 716,
    merged: true,
    title: "Ground root-cause analysis in incident evidence",
  },
  {
    repo: "modelcontextprotocol/typescript-sdk",
    number: 2909,
    merged: false,
    title: "Fix optional query matching in URI templates",
  },
  {
    repo: "huggingface/sentence-transformers",
    number: 4073,
    merged: false,
    title: "Run the CrossEncoder when only min_score is set",
  },
  {
    repo: "zed-industries/zed",
    number: 63992,
    merged: false,
    title: "Register the thread switcher after enabling AI",
  },
  {
    repo: "agno-agi/agno",
    number: 10072,
    merged: false,
    title: "Restore direct answers for simple route-mode requests",
  },
  {
    repo: "browser-use/browser-use",
    number: 5690,
    merged: false,
    title: "Track actual Enter dispatch, not matching substrings",
  },
  {
    repo: "huggingface/diffusers",
    number: 14708,
    merged: false,
    title: "Preserve positional arguments through config round trips",
  },
  {
    repo: "chroma-core/chroma",
    number: 7610,
    merged: false,
    title: "Reject whitespace-padded collection names",
  },
];
