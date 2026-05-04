# Review Notes for `FloraLink_Final_Report_submission_ready.docx`

## Overall Assessment

The report is **strong in coverage and effort**. It contains the expected academic sections, a large amount of system analysis material, implementation evidence, testing content, and appendices. The overall project narrative is also clear: the work starts from secure software development concepts, moves through requirements and system design, and ends with implementation and testing. This gives the report a solid academic structure.

At the same time, the document still has a number of **high-priority submission issues** that should be fixed before final hand-in. The most important problems are not related to the project idea itself, but to **document quality, internal consistency, numbering, and accuracy of a few technical claims**. In its current state, the report looks substantial, but an evaluator will immediately notice formatting and consistency problems in the table of contents, section numbering, captions, and a few implementation descriptions.

## Priority Review Table

| Priority | Area | Observation | Why it matters | Recommended action |
|---|---|---|---|---|
| High | Table of Contents | The TOC is broken. It shows raw field text such as `TOC \h \o "1-3"`, multiple `Error: Reference source not found`, and a typo in `Table of Contennts`. | This is the first thing the instructor sees after the title page, and it makes the document look unfinished. | Regenerate the table of contents in Word, update all fields, and fix the typo to `Table of Contents`. |
| High | Section numbering | Several sections are misnumbered. For example, Section 3 contains `2.1 Executive Summary` and `2.2 Use Case Model`, while the TOC later shows subsections under Section 4 labeled as `3.2.1`, `3.3.1`, and `3.2.5`. | Incorrect numbering weakens the academic presentation and gives the impression of copy-paste assembly. | Apply one numbering system consistently across headings and captions, then update the TOC again. |
| High | Internal consistency | Section 1.4 says that no persistent database is used and that the implementation relies on in-memory state, but later sections clearly describe a database-backed backend using TiDB/Drizzle and persistent `customer_accounts` storage. | This is a direct contradiction inside the report. | Rewrite Section 1.4 so it reflects the final implemented state. If only some features remain prototype-level, say that explicitly instead of saying no persistent database is used. |
| High | Placeholders | Appendix A and Appendix B still contain placeholder instructions such as `[Insert detailed test execution logs here ...]` and `[Insert any additional system screenshots ...]`. The references section also contains `[Add any additional sources used throughout the project]`. | Placeholders strongly suggest that the report was not finalized. | Either replace these placeholders with real content or remove the placeholder text completely. |
| High | Technical accuracy | The report uses both `bcrypt` and `scrypt` when describing password hashing. For example, manual test tables mention `bcrypt`, while later analysis states `scrypt`. | This creates a factual inconsistency in a security-focused report. | Use **one correct hashing description everywhere**. If the implementation uses salted `scrypt`, change every `bcrypt` mention accordingly. |
| High | Testing claims | Some testing statements are very strong and should match the implementation exactly. In particular, claims about server sessions, JWT cookies, lockout enforcement, and backend behavior should be checked carefully against the actual code and runtime evidence. | Overstated or inaccurate claims are riskier than modest, precise claims. | Reword any statement that cannot be directly demonstrated by screenshots, logs, or source code. |
| Medium | Language quality | There are scattered typos and wording issues such as `Warnning`, `Automate d`, `Auth_secuirty_test.ts`, and awkward sentence breaks. | These do not destroy the report, but they reduce polish. | Do one final proofreading pass focused only on spelling, tense, capitalization, and broken words caused by formatting. |
| Medium | Caption numbering | Tables appear as `Table 0-1`, `Table 0-2`, and so on. | This often happens when Word captions are not configured or refreshed correctly. | Update caption numbering so tables and figures follow a normal academic sequence. |
| Medium | Blank pages | The document includes blank appendix pages around pages 104–106. | Blank pages make the document longer without adding value. | Remove empty pages unless they are required by a printing format rule. |
| Medium | Conclusion quality | The conclusion contains useful content but some sentences are too compressed and grammatically overloaded. | The final section should end the report strongly and clearly. | Split long sentences and make the achievement statement more precise and readable. |

## What Is Already Good

The report has several strengths that should be preserved. The **title page is appropriate**, the **abstract gives a useful overview**, and the project demonstrates good academic ambition by linking requirements analysis, misuse cases, mitigation controls, system design, implementation, and testing. The testing sections are also richer than in many student reports because they include both manual and automated evidence. This is a strong point and should remain prominent in the final version.

The implementation narrative is also better than a purely conceptual report. The document does not stop at diagrams and theory; it shows a practical prototype, screenshots, and structured verification. That gives the work credibility. The testing and security sections, in particular, can become one of the strongest parts of the report once the consistency and formatting issues are cleaned up.

## Detailed Notes by Section

### Abstract

The abstract is generally effective, but one phrase should be improved: **"managed logo integration"** sounds weak and not academically important compared with the other achievements. It would be better to replace it with something more substantial, such as **"implemented secure authentication prototype"**, **"validated backend-integrated login workflow"**, or **"tested authentication controls"**.

### Introduction and Scope

The introduction is readable and appropriate. However, the **scope and limitations** section must be updated because it still reflects an earlier prototype stage. If the final version now uses persistent account storage, then the report should say something like:

> The current implementation focuses on the authentication-related security controls and uses persistent account storage for the implemented module, while the wider business features remain at the design or prototype level.

That wording is much more accurate than saying there is no persistent database at all.

### Requirements and Modeling

The content itself appears substantial, but the **heading structure is unstable**. A reader should never see Section 3 starting with subsection numbers that belong to Section 2. This is one of the clearest signs that heading styles or numbering settings were copied from an earlier draft. Fixing this will significantly improve the professionalism of the report without changing the content.

### Design and Implementation Sections

These sections appear rich and useful, especially because they include diagrams, UI material, database content, and implementation screenshots. The main improvement needed here is **numbering consistency** and **caption cleanup**. Once captions and heading numbers are corrected, these sections will read much more smoothly.

### Testing Strategy, Test Cases, and Results

This is one of the strongest parts of the report, but it is also the section where **precision matters most**. The reported counts are persuasive, yet every quantitative claim should remain internally consistent. For example, if the total is **135 automated tests**, then all earlier and later mentions should use exactly the same total and avoid leftover numbers from previous drafts. Likewise, if the combined total is **158**, every table and summary line should match that total precisely.

You should also check the wording around **lockout**, **sessions**, **cookies**, and **reCAPTCHA validation**. If a control is currently implemented only in the interface layer for demonstration purposes, the report should clearly say so and should not accidentally imply stronger backend enforcement than what is actually implemented. A careful report sounds more credible when it distinguishes between:

| Type of statement | Better style |
|---|---|
| Fully implemented and verified | Use direct, confident wording. |
| Implemented as prototype/demo behavior | State that it is demonstrated in the current prototype and note production improvement separately. |
| Planned future control | Place it under future work, not current results. |

### Conclusion

The conclusion has the right ideas, but it needs a **cleaner academic finish**. It currently compresses too many achievements into long sentences. A better conclusion should do three things clearly: summarize what was implemented, state what was verified, and separate future work from current achievement. The content is already there; it simply needs tightening.

### References and Appendices

This section needs immediate attention. A finished report should not contain unfinished instructions to the writer. The references list should include only actual sources that were used, formatted consistently. The appendices should either contain real material or be shortened. If you do not need Appendix A or B, it is better to remove them than leave template notes inside the final submission.

## Best Final Fixes Before Submission

| Action | Estimated importance |
|---|---|
| Regenerate TOC and fix all broken references | Critical |
| Correct all heading and subsection numbering | Critical |
| Remove placeholder text from references and appendices | Critical |
| Fix the database inconsistency in Scope and Limitations | Critical |
| Standardize hashing terminology to one correct algorithm | Critical |
| Proofread spelling and formatting issues | High |
| Remove blank pages | Medium |
| Tighten conclusion wording | Medium |

## Final Recommendation

The report is **very close to being submission-ready in substance**, but **not yet submission-ready in presentation**. The core academic work is there, and the security/testing material is stronger than average. However, the broken table of contents, numbering inconsistencies, placeholder text, and a few technical contradictions should be fixed before submission. Once those are addressed, the report will look much more polished, coherent, and convincing.
