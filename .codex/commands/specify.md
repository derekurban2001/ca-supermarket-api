---
name: specify
description: Create or update the feature specification from a natural language feature description.
---

Given a feature description, do this:
(If the feature description isn't provided as an argument then request the feature description from the user)

1. Run the script `.codex/scripts/powershell/create-new-feature.ps1 -Json "$ARGUMENTS"` from repo root and parse its JSON output for BRANCH_NAME and SPEC_FILE. All file paths must be absolute.
2. Load `.codex/templates/spec-template.md` to understand required sections.
3. Write the specification to SPEC_FILE using the template structure, replacing placeholders with concrete details derived from the feature description (arguments) while preserving section order and headings.
4. Report completion with branch name, spec file path, and readiness for the next phase.

Note: The script creates and checks out the new branch and initializes the spec file before writing.
