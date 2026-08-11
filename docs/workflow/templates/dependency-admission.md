# <TASK ID> — Dependency Admission

## Decision Mode

`<NO DEPENDENCY CHANGE | ADMISSION REVIEW REQUIRED>`

When the decision is `NO DEPENDENCY CHANGE`, record manifest and lockfile identities proving no dependency drift. Otherwise complete every section below before installation or lockfile mutation.

## Exact Identity and Need

- Package/repository/artifact: `<exact identity and source>`
- Exact version/immutable reference/integrity: `<values>`
- Classification and owning milestone: `<Source 06 class and owner>`
- Concrete need and insufficiency of existing tools: `<evidence>`

## Authority and Adapter Boundary

- Product/engineering authority: `<owner>`
- Public adapter boundary: `<API and containment>`
- Canonical-state restrictions: `<rules>`

## Supply-Chain Impact

- Direct and transitive graph: `<inventory>`
- Licenses, copyright, notices: `<evidence>`
- Native/WASM/downloaded binaries: `<inventory/provenance>`
- Install scripts and build behavior: `<evidence>`
- Security and maintenance: `<review>`
- Registry/source/hosted-service implications: `<review>`

## Artifact and Distribution Impact

- Editor/player/build/release inclusion: `<scope>`
- Bundle and packaged-file impact: `<evidence>`
- SBOM, notice and compliance changes: `<exact outputs>`

## Removal, Tests, and Approval

- Replacement/removal path: `<procedure>`
- Boundary and negative tests: `<commands/cases>`
- Reviewer decision: `<NOT YET REVIEWED | decision>`
- Owner approval: `<NOT AUTHORIZED | exact authority>`

