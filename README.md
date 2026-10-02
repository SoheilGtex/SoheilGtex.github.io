# Soheil Salmani

A buildless static site with Home, Academics and Industry. The approved typography,
colors, hero, interactive object, navigation and Industry composition are preserved.
The website uses HTML, CSS, vanilla JavaScript, SVG and JSON. No package installation
or external font request is required to run it.

## Local preview

From the extracted website directory:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000/`. Serve over HTTP rather than opening HTML with
`file://`, so the JSON enhancements can load.

## Academic source and visibility

Edit `data/academics.json`. Every course has an explicit boolean
`profile_visible`. Only `true` courses appear in public Map/List views and the
relevant coursework average. Hidden courses are preserved in the source.

A new course needs data only:

```json
{
  "id": "unique-course-id",
  "title": "Official English course title",
  "credits": 3,
  "grade": null,
  "status": "planned",
  "category": "core",
  "profile_visible": true,
  "semester": null,
  "prerequisites": []
}
```

- `id`: stable, unique lowercase letters/numbers/hyphens. This is a site ID, not
  an official university code.
- `title`: public English title. `title_fa` and `source_record` preserve supplied
  Persian names and earlier raw factual values. Calculus I/II/III use normalized
  public titles while their General Mathematics source names remain recorded.
- `credits`: a positive number when known; omit or use `null` when unknown.
- `grade`: final numeric grade from 0 to 20 after completion; otherwise `null`.
- `status`: `completed`, `in_progress` or `planned`. Use in progress only for
  confirmed current registration.
- `category`: existing academic category, or `interest_only` for study beyond
  the formal degree chart. Category labels are editable under `categories`.
- `profile_visible`: boolean `true` or `false`, never a string.
- `semester`: optional internal metadata, never used for public grouping.
- `prerequisites`: documented course IDs only. Do not infer relationships.

Optional course fields include `code`, `academic_year`, `instructor` and `note`.
The details view reflects the course data without redesign or HTML editing.
Update `record_as_of` and source information when facts change. `grades_as_of`
records the earlier grade evidence separately.

The public groups are always COMPLETED, IN PROGRESS, PLANNED and BEYOND CURRICULUM.
The final group contains every `interest_only` course and retains its individual
status. It does not imply degree requirements, registration or completion.

General/non-core requirements are hidden, including Persian, religion/history,
sport, family/population and Student Life Skills. General English remains visible.
The old Linear Optimization alternative is preserved but hidden because the
current explicit plan supersedes it. Previous semester projections and notes
are preserved under `source_history`, not presented as current registrations.

## GPA scopes and an externally evaluated 4.00 value

GPA = sum(grade × credits) / sum(credits), including only completed courses with
valid numeric final grades and known positive credits. In-progress and planned
courses never contribute, even if a grade is accidentally entered.

- Working cumulative GPA uses the supplied completed record, including hidden
  general requirements and Student Life Skills, and excludes `interest_only`
  study. It is a working student calculation, not a registrar-issued GPA.
- Relevant coursework average uses profile-visible completed graded coursework.
- Completed visible credits count known completed credits, including a completed
  course with a missing final grade. Such a course does not enter the average.

Current working calculation: 1246.75 / 69 = 18.068840579710145, displayed as
18.07 / 20. Relevant calculation: 986.75 / 56 = 17.620535714285715, displayed as
17.62 / 20. Calculated GPA values are never manually hardcoded into HTML.

There is no automatic 20-to-4 conversion. The data contains:

```json
"gpa_4": {
  "value": null,
  "method": null,
  "note": "Use a named credential evaluator or receiving institution method."
}
```

A null value is omitted from the public result. To show a real evaluation later,
enter the received numeric value and a nonempty named evaluator/institution
method, plus its scope and basis in `note`. The existing renderer automatically
shows the value, method and note. It accepts numeric values from 0 to 4 only and
never generates or rescales them. The official transcript and receiving
institution's instructions take precedence.

## Current coursework and teaching

The source has 57 records; 47 are visible:

| Public group | Courses | Known credits |
| --- | ---: | ---: |
| Completed | 18 | 56 |
| In progress | 5 | 19 |
| Planned degree coursework | 16 | 53 |
| Beyond curriculum | 8 | 26 |

Current registrations are Numerical Linear Algebra, Mathematical Analysis,
Introductory Mathematical Modeling, Operating Systems, and Design and Analysis
of Algorithms. All have null grades and are excluded from the averages.
Future course credits and the interest-only plan follow the latest direct
student confirmation. No future semester, grade or prerequisite is invented.

Teaching Assistant data lives under `teaching_assistant`, including institution,
dates and a `courses` array. MATLAB II is included alongside Programming with R,
Mathematical Software, Probability I and Statistical Methods. Changes render
from JSON without editing the teaching HTML.

## Coursework Map and List

Map uses one column per status/category group. Select a course for detail;
arrow keys move focus between nodes. List uses the same data and minimal native
collapsible sections. The completed group opens initially; mobile opens List
by default and desktop opens Map. Tab arrow keys, Home and End switch views.
Escape closes inline course details and returns focus to the course button.

The current map asserts no prerequisite relationships. The model preserves
`prerequisites`, but edges require `prerequisite_data_status: "verified"`.
Change this only after supplying documented relationships. Then arrows run
from prerequisite to dependent course, with hidden nodes excluded. Duplicate
IDs, unknown references, self-links and cycles are rejected.

## Projects and saved fallback content

Edit `data/projects.json` for project IDs, exact titles, short descriptions and
absolute HTTPS URLs. The renderer loops over the array; adding a project object
immediately adds a row without HTML editing. The existing names and URLs are
unchanged. Text is safely inserted as text, not interpreted as HTML.

Interactive views reflect JSON on every page load. After changing academic or
project data, refresh the saved no-JavaScript content:

```bash
python3 tools/refresh_fallback.py
```

This optional maintenance command refreshes the status-grouped course list,
TA history and project list. It is not a required build step. Navigation,
selectable email, mailto, all saved courses/projects and PDF links work without
JavaScript. Live averages and the Map require JavaScript. Fetch failures retain
saved readable content.

## Email reliability

The full homepage address remains prominent. With Clipboard API support, clicking
the address or using Enter/Space copies it and displays Copied for 2.2 seconds.
The adjacent icon always links to the default mail client. If the API is absent,
the address remains selectable with its mailto fallback. A rejected write selects
the address, reports Select to copy, and restores the fallback link.

Clipboard access depends on browser support, permission and a secure context
(HTTPS or localhost). Mailto continues to depend on the visitor's configured
handler. Neither action silently guarantees email delivery.

## Preserved design and documents

Dark remains the default. Theme selection persists when localStorage is available.
The homepage mathematical object, motion behavior, palettes, typography and
Industry layout are unchanged. Reduced motion still disables entrance effects
and interactive deformation. Fonts remain self-hosted with included OFL licenses.
Both original PDFs are byte-for-byte unchanged.

Relative URLs support account-site roots and repository subpaths. `.nojekyll`
is included. Canonical/social metadata and sitemap currently use
`https://soheilgtex.github.io/`; update them only if the final address changes.
No deployment or live-site modification was performed.

## Verification

Pure model checks require only Node:

```bash
node --test tests/*.test.mjs
```

Optional browser QA uses Playwright if installed separately in a testing environment:

```bash
node tests/browser-qa.cjs
```

Optional `QA_BROWSER_PATH` selects a Chromium executable, `QA_AXE_PATH` selects
an existing axe-core script, and `QA_OUTPUT_DIR` saves screenshots and a report.
These are test-only settings, not website dependencies. QA fixtures are isolated
mock responses and are never saved in delivered JSON.

See `CHANGES.md` for this pass and `VALIDATION.md` for completed checks and limits.
