---
name: plan
description: Execute the implementation planning workflow using the plan template to generate design artifacts.
---

Plan how to implement the specified feature.

Given implementation details, do this:
(If the implementation details isn't provided as an argument then request the implementation details from the user)

1. Run `.codex/scripts/powershell/setup-plan.ps1 -Json` from the repo root and parse JSON for FEATURE_SPEC, IMPL_PLAN, SPECS_DIR, BRANCH. All future file paths must be absolute.
2. Read and analyze the feature specification to understand:

   - The feature requirements and user stories
   - Functional and non-functional requirements
   - Success criteria and acceptance criteria
   - Any technical constraints or dependencies mentioned

3. Read the constitution at `.codex/memory/constitution.md` to understand constitutional requirements.

4. Execute the implementation plan template:

   - Load `.codex/templates/plan-template.md` (already copied to IMPL_PLAN path)
   - Set Input path to FEATURE_SPEC
   - Run the Execution Flow (main) function steps 1-10
   - The template is self-contained and executable
   - Follow error handling and gate checks as specified
   - Let the template guide artifact generation in $SPECS_DIR:
     - Phase 0 generates research.md
     - Phase 1 generates data-model.md, contracts/, quickstart.md
     - Phase 2 generates tasks.md
   - Incorporate user-provided details from arguments into Technical Context: $ARGUMENTS
   - Update Progress Tracking as you complete each phase

5. Verify execution completed:

   - Check Progress Tracking shows all phases complete
   - Ensure all required artifacts were generated
   - Confirm no ERROR states in execution

6. Report results with branch name, file paths, and generated artifacts.

Use absolute paths with the repository root for all file operations to avoid path issues.
