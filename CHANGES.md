# Focused data, Academics UX and email reliability pass

This pass preserves the approved visual design. The hero, typography, color
variables, navigation, mathematical object, Industry layout, project structure,
fonts and original PDFs are unchanged. Existing academic visual declarations are
retained; former semester selectors are renamed to coursework selectors only.
Small additions support email feedback, empty groups and an optional evaluated GPA.

## Email

The full address remains visible. Clipboard support enhances the address action
with copying and a temporary Copied message. The separate icon always retains
mailto. An absent API leaves a selectable mailto link; a rejected write selects
the text and restores fallback behavior. No email is sent by this interaction.

## GPA and source policy

The former linear 4.00 presentation and rescaling function are removed. The page
shows working cumulative GPA 18.07 / 20 and relevant coursework average 17.62 / 20,
computed from distinct credit-weighted completed-course scopes.

The working cumulative scope includes supplied hidden general requirements and
Student Life Skills, matching the current working record, and excludes interest
study. The relevant scope includes profile-visible completed graded coursework.
In-progress/planned courses never enter either calculation.

`gpa_4.value` and `method` are null. A later named external evaluation can render
from JSON without HTML changes; no conversion or equivalence is generated.

## Coursework

- Every source course has explicit boolean profile visibility. Hidden general
  courses remain in JSON; General English remains visible.
- The public layout uses COMPLETED, IN PROGRESS, PLANNED and BEYOND CURRICULUM,
  with Map/List views. Public semester grouping and semester details are removed.
- Five directly confirmed in-progress courses total 19 credits and have no grades.
- Sixteen formal planned courses total 53 credits; eight interest-only courses
  total 26 credits and are kept outside formal degree requirements.
- Calculus I/II/III are normalized display names. Stable IDs, Persian titles and
  earlier raw English/source values are preserved.
- Old provisional options are superseded by the current explicit plan. The old
  Linear Optimization alternative remains in JSON but is hidden; Nonlinear
  Optimization is separately included as supplied.
- No future semester, grade or prerequisite is invented. Documented dependency
  support is retained behind `prerequisite_data_status: "verified"`.
- TA history is data-driven and includes MATLAB II at Kharazmi University,
  Jan 2026 - present, alongside the four existing course names.

The source contains 57 records and public views show 47: 18 completed, 5 in
progress, 16 formal planned and 8 beyond curriculum. Relevant completed credits
remain 56. The supplied completed source remains 25 courses and 69 graded credits.

## Maintainability and assumptions

The latest direct student confirmation controls current statuses, credits and
future study plans. Previous records and projections are retained as source
history. No official transcript, degree requirement, conversion or registration
is inferred beyond that confirmation.

Courses, visibility, grades, category and TA history render from
`data/academics.json`. Projects continue to render every object in
`data/projects.json`; existing exact titles and URLs are unchanged. Refresh the
saved fallback with `python3 tools/refresh_fallback.py` after data edits.

Tests include isolated future course/project additions, visibility changes and
an explicitly synthetic named GPA evaluation. Test fixtures never enter the
actual JSON. `README.md` documents field rules; `VALIDATION.md` records results.
No publishing, deployment or live-site mutation was performed.

## Changed files relative to the approved bundle

| File | Change |
| --- | --- |
| `CHANGES.md` | Updated |
| `README.md` | Updated |
| `VALIDATION.md` | Updated |
| `academics/index.html` | Updated |
| `assets/academic-model.mjs` | Updated |
| `assets/academics.mjs` | Updated |
| `assets/email.mjs` | Added |
| `assets/site.css` | Updated |
| `data/academics.json` | Updated |
| `index.html` | Updated |
| `tests/academic-model.test.mjs` | Updated |
| `tests/browser-qa.cjs` | Added |
| `tools/refresh_fallback.py` | Updated |
