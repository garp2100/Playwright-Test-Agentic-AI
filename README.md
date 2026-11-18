# Playwright Test Agents with Claude Code

This repo uses **Playwright Test Agents** to plan, write and fix end-to-end tests with an AI coding agent (Claude Code). This README covers how to set up the agents, how the workflow runs, which prompts to use, and what to watch out for. It does not describe the app under test.

---

## How it works

Three agents run one after another. A shared **seed test** gives each of them a known starting point.

```
            ┌──────────────┐   specs/*.md   ┌────────────────┐   e2e/**/*.spec.ts   ┌──────────────┐
  you  ───▶ │   PLANNER    │ ─────────────▶ │   GENERATOR    │ ───────────────────▶ │    HEALER    │
            │ explores app │   test plan    │ writes tests   │   tests              │ runs & fixes │
            └──────┬───────┘                └───────┬────────┘                      └──────┬───────┘
                   │                                │                                      │
                   └───────────── all start from e2e/seed.spec.ts ─────────────────────────┘
```

| Agent | Input | Output | What it can use |
|---|---|---|---|
| `playwright-test-planner` | A feature or area to cover | A Markdown test plan in `specs/` | A live browser (navigate, click, type, take snapshots) |
| `playwright-test-generator` | One or more scenarios from a plan | `.spec.ts` files | A live browser; it records what you do and writes it out as test code |
| `playwright-test-healer` | Failing tests | Fixed tests | The test runner, debugger, page snapshots and network logs |

The agents are defined in [.claude/agents/](.claude/agents/). They reach the browser through the **Playwright Test MCP server**, which is set up in [.mcp.json](.mcp.json).

---

## Installation

### Prerequisites
- Node.js 18 or newer
- [Claude Code](https://claude.com/claude-code), either the CLI or the VS Code / JetBrains extension
- `@playwright/test` **1.56 or newer** (the version that added the agents). This repo uses 1.65.

### 1. Install dependencies
```bash
npm install
npx playwright install          # browser binaries
```

### 2. Generate the agent definitions
These files are already committed in this repo. To set up a new repo, or to refresh the agents after upgrading Playwright, run:
```bash
npx playwright init-agents --loop=claude
```
This creates:
- `.claude/agents/playwright-test-{planner,generator,healer}.md`: the agent definitions
- `.mcp.json`: registers the `playwright-test` MCP server (`npx playwright run-test-mcp-server`)
- `e2e/seed.spec.ts`: an empty seed test
- `specs/`: a folder for test plans

Other `--loop` values are `codex`, `copilot`, `opencode` and `vscode`, for other agent tools. Re-run `init-agents` after every Playwright upgrade, because the agent files are tied to the version of the MCP tools.

### 3. Check that the MCP server is connected
Restart Claude Code, or reload the VS Code window, and run:
```
/mcp
```
`playwright-test` should show as **connected**. Run `/agents` to see the three agents.

### 4. Optional: hide the browser
The browser window is visible by default. To run it in the background instead, edit [.mcp.json](.mcp.json):
```json
{
  "mcpServers": {
    "playwright-test": {
      "command": "npx",
      "args": ["playwright", "run-test-mcp-server", "--headless"]
    }
  }
}
```
Restart the MCP server after changing this, but not while an agent is running, because that cuts it off. You can also minimize the visible window and the agents keep working.

---

## The seed test

[e2e/seed.spec.ts](e2e/seed.spec.ts) runs **before every agent session**. Agents carry on from the state the seed leaves the page in, so it should:

- open the starting page (`page.goto('/')` uses `baseURL` from [playwright.config.ts](playwright.config.ts));
- **wait until the app has loaded**, by checking for a real element, not with a fixed pause;
- set up anything every test needs, such as a cookie banner closed or a user signed in.

```ts
test('seed', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/My App/);
  await expect(page.locator('[data-test="main-content"]')).toBeVisible();
});
```

If one area needs a different starting point, for example signed-in pages, add another seed such as `e2e/seed-logged-in.spec.ts` and name it in that plan.

---

## How to call an agent

In Claude Code you can:

1. **@-mention it.** This always runs that agent:
   ```
   @agent-playwright-test-planner plan tests for the checkout flow
   ```
2. **Ask by name in plain language.** Claude hands the task to that agent:
   ```
   Use the playwright-test-planner agent to plan tests for the checkout flow.
   ```

> ⚠️ `@.claude/agents/playwright-test-planner.md` (with the file path) only **attaches the file** as context. It doesn't run the agent. Use `@agent-<name>`.

Agents run in the background. You can keep chatting while they work, and Claude reports back when they finish. Ask "status?" at any time.

---

## Prompts that work well

### 1. Planner: write a test plan
```
@agent-playwright-test-planner Create a test plan for the <feature> section.
Seed file: e2e/seed.spec.ts. Save it to specs/<feature>.md.
Cover happy paths, edge cases, and negative cases. Each scenario must be
independent and start from the seed state. Put test files under e2e/<feature>/.
Save the plan in parts as you go (after each sub-area) so progress isn't lost.
Don't use browser_run_code_unsafe.
```
**Tips:**
- Keep each plan to **one feature or area**. Big plans take longer and are more likely to stall.
- Tell it the **test folder** (`e2e/...`). By default it may write `tests/...`, which `testDir: './e2e'` won't run.
- Read the plan before generating tests. It's quicker to fix a scenario in Markdown than in code.

### 2. Generator: write tests from the plan
Do **one suite at a time** and check the result before moving on:
```
@agent-playwright-test-generator Generate tests for the "<Suite name>" suite in
specs/<feature>.md, one scenario at a time. Seed: e2e/seed.spec.ts.
Use the file paths listed in the plan. Wait for the UI to actually update
(expect.poll / web-first assertions / waitForResponse) — no waitForTimeout.
Don't use browser_run_code_unsafe. Report any differences between the plan and
how the app really behaves.
```
**Tips:**
- The generator **cannot run tests**. It only tries the steps in the browser. Always run the generated files yourself, or have the healer run them:
  ```bash
  npx playwright test e2e/<feature>
  ```
- Ask it to **report differences from the plan**. Generators often find real bugs or wrong assumptions in the plan.

### 3. Healer: fix failing tests
```
@agent-playwright-test-healer Fix the failing tests in e2e/<feature>/.
Run each file in chromium, firefox, and webkit until it passes. If a failure is
a genuine app bug, keep the correct assertion and mark the test with test.fail()
plus a comment, rather than weakening it. Don't use fixed timeouts.
```
**Tips:**
- If you already know the cause, **include it in the prompt**, for example "the API sends filters in the request body, not the URL". The healer will finish much faster.
- The healer can't delete files. Remove any temporary probe specs it leaves behind, such as `tmp-probe.spec.ts`.
- Re-run the **whole folder** afterwards to make sure the fixes didn't break other suites.

---

## Recommended workflow

1. **Seed:** write `e2e/seed.spec.ts` and check it passes with `npx playwright test e2e/seed.spec.ts`.
2. **Plan:** run the planner on one feature and review `specs/<feature>.md`.
3. **Generate:** run the generator on one suite from the plan.
4. **Run:** `npx playwright test e2e/<feature>` in all browsers.
5. **Heal:** if anything fails, send the failures to the healer.
6. **Review and commit:** read the tests, and confirm bugs marked `test.fail()` are real.
7. Repeat steps 3–6 for the next suite.

Smaller batches are faster, easier to review, and much less likely to stall.

---

## Troubleshooting

| Symptom | Likely cause and fix |
|---|---|
| The agent has done nothing for several minutes | It's probably stuck on a browser step, often `browser_run_code_unsafe` with a script that waits for something that never happens. Stop the agent and restart it with "don't use browser_run_code_unsafe" and a smaller scope. Ask Claude to watch long runs and warn you when they stall. |
| Agents can't find any browser tools | Run `/mcp`. Check that `playwright-test` is connected, and reconnect or reload the window if not. |
| Generated tests never run | The file paths are outside `testDir` (for example `tests/` while the config uses `./e2e`). Fix the paths in the plan. |
| Tests time out on `waitForResponse` | The check for the request is wrong. Some APIs send filters in the request body (or use unusual methods like `QUERY`), not the URL. Log the real requests and match on `request.postData()`. |
| A test passes in one browser and fails in another | Usually a race, such as responses arriving out of order or the UI lagging behind input. Wait for the response for the **exact** final state rather than any matching response. |
| A plan scenario says "verify…" | The planner didn't actually check that behaviour. Expect the generator or healer to adjust it. |

---

## Project layout

```
.claude/agents/        Agent definitions (generated by init-agents)
.mcp.json              Playwright Test MCP server config
playwright.config.ts   baseURL, testDir (./e2e), browser projects
specs/                 Test plans written by the planner (Markdown)
e2e/seed.spec.ts       Seed test – starting state for every agent
e2e/<feature>/         Generated tests, one file per scenario
e2e/helpers/           Shared helpers extracted while healing
```

## Useful commands

```bash
npx playwright test                         # all tests, all browsers
npx playwright test e2e/filters             # one folder
npx playwright test --project=chromium      # one browser
npx playwright test --ui                    # interactive UI mode
npx playwright show-report                  # open the last HTML report
npx playwright init-agents --loop=claude    # (re)generate agent files
```

## References
- Playwright Test Agents: https://playwright.dev/docs/test-agents
- Claude Code subagents: https://docs.claude.com/en/docs/claude-code/sub-agents
- Claude Code MCP: https://docs.claude.com/en/docs/claude-code/mcp
