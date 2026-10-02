# Validation: data, Academics UX and email reliability

Verified locally on 2 October 2026. No publishing, deployment or live-site
modification was performed.

## Approved design preservation

The existing CSS declarations match the approved bundle, apart from mechanical
renaming of semester selectors to coursework selectors. Appended rules only
support email feedback, optional evaluated GPA and empty coursework groups.

Byte/string comparison confirmed that these approved elements are unchanged:

- Font files, typography declarations and palette variables.
- Header/navigation markup on all three routes.
- Hero sentence, mathematical object, gateway and document links.
- Homepage graph response code and reduced-motion behavior.
- Industry page, Linux composition, project structure and descriptions.
- `data/projects.json`, its renderer, theme scripts and favicon.
- Both original PDF documents.

Final academic desktop/mobile screenshots were inspected in both themes. The
same minimal surfaces are retained; only requested data, labels, grouping and
email behavior changed.

## Academic source and calculation checks

Sixteen Node tests pass, including 13 academic-model checks and the three
unchanged numerical-object checks.

| Check | Verified result |
| --- | --- |
| Complete source / profile-visible records | 57 / 47 |
| Completed visible courses / credits | 18 / 56 |
| Confirmed in-progress courses / credits | 5 / 19 |
| Formal planned courses / known credits | 16 / 53 |
| Beyond-curriculum courses / known credits | 8 / 26 |
| Current in-progress grades | All null |
| New future semesters and grades | None invented |
| Documented prerequisites / visible edges | 0 / 0 |
| General English | Visible |
| General/non-core requirements | Preserved in JSON, hidden publicly |
| Calculus I/II/III | Normalized titles, Persian/raw sources preserved |
| TA course history | Existing four courses plus MATLAB II |
| Evaluated 4.00 value and method | Both null; result omitted |

Working cumulative calculation: weighted sum 1246.75, 69 graded credits;
1246.75 / 69 = 18.068840579710145, displayed as 18.07 / 20. It includes the
supplied completed record, including hidden general requirements and Student
Life Skills, and excludes interest-only study.

Relevant calculation: weighted sum 986.75, 56 graded credits;
986.75 / 56 = 17.620535714285715, displayed as 17.62 / 20. It uses only
profile-visible completed graded coursework. Both methods exclude in-progress
and planned courses, including fixtures that accidentally assign numeric grades.
Invalid/missing grades and credits do not enter the weighted denominator.

A 4.00 value is never computed or rescaled. An externally supplied numeric value
renders only with a nonempty named method. A synthetic QA evaluation confirmed
that future support works; the delivered data remains null.

The Map has four status/category columns and no asserted dependency links.
A prerequisite array alone cannot activate arrows: verified data status is
required. Missing references, duplicate IDs, invalid visibility and cycles are
rejected. Hidden nodes remain excluded from both public views and dependencies.

## Browser verification

Playwright with headless Chromium 131 completed 15 grouped browser checks:

- Real clipboard copying, temporary Copied feedback, keyboard Space and separate
  mailto action.
- Absent Clipboard API: selectable full address and unchanged mailto fallback.
- Rejected write: selection, fallback feedback and preserved mailto.
- All routes/assets/JSON/PDF links at root and repository subpath.
- Distinct cumulative/relevant averages, null evaluated GPA, four public groups,
  normalized titles, visibility and updated TA history.
- Keyboard tabs, course selection and Escape dismissal.
- Data-only future course addition updates title, credits, grade, category and
  both averages, while a supplied semester number never appears as public grouping.
- A data-only visibility change removes the course and its relevant contribution.
- A synthetic named external GPA appears without editing HTML.
- A fifth project object renders automatically; markup remains safe text.
- Without JavaScript, mailto, selectable email, native status disclosures,
  all 47 saved course rows and four projects remain usable.
- Failed academic fetch shows the complete saved status-based record.
- Both themes/all routes have no horizontal page overflow at widths 1366, 768,
  390 and 320. Mobile opens List; desktop opens Map.
- Reduced-motion behavior remains intact.
- No runtime errors or broken local responses.

The fixtures are isolated mocked responses. No test course, project or synthetic
GPA value is present in the delivered source JSON.

Axe-core 4.10.3 reported zero WCAG 2.1 A/AA violations in 16 route/view/theme/width
combinations. A final targeted academic check after label/style corrections also
passed both Map/List views in dark/light themes at desktop/mobile widths.
Automated checks do not certify complete accessibility; Safari, Firefox and
assistive-technology sessions were not tested.

## Reliability limits and evidence

Clipboard functionality depends on API support, permission and secure context;
its fallback was tested. Mailto still depends on a configured mail handler and
is not proof of message delivery. No message is sent by the website.

The academic record remains student-provided. Its working cumulative GPA is not
a registrar-issued GPA, and the university transcript takes precedence. Current
statuses, credit updates and study plans follow the latest explicit student
confirmation. No semester, prerequisite, official equivalence or degree
requirement was inferred beyond that confirmation.

The existing project names and URLs remain unchanged. Both PDF downloads retain
the supplied file contents, including their original contact information.

PDF SHA-256 values:

- Academic CV: `68bed05ab2fc97ba01f9f3894696767ecf23036da7bffbaf602cf82bb0d2b67d`
- Industry Resume: `ce4a2d23f78f3d42ef20f1308ee33a874056c22497589273e35108b8f7fa0d17`
