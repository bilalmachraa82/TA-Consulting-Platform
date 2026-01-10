# Directives

This folder contains Standard Operating Procedures (SOPs) for the AI agent.

## What are Directives?

Directives are Markdown files that define:
- **Goals**: What the task should accomplish
- **Inputs**: What data/parameters are needed
- **Tools/Scripts**: Which scripts in `scripts/` to use
- **Outputs**: Expected results
- **Edge Cases**: Known issues and how to handle them

## How to Use

1. Create a new `.md` file for each SOP (e.g., `scrape_avisos.md`)
2. Follow the template below
3. The AI agent will read these and execute accordingly

## Template

```markdown
# [Task Name]

## Goal
[What this task accomplishes]

## Inputs
- [Required input 1]
- [Required input 2]

## Scripts Used
- `scripts/[script-name].ts` - [purpose]

## Expected Output
[Description of output]

## Edge Cases
- [Known issue 1]: [How to handle]
- [Known issue 2]: [How to handle]

## Learnings
[Updated by AI agent as new edge cases are discovered]
```

## Current Directives

_Add new directives here as they are created._
