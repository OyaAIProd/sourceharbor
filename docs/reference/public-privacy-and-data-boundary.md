# Public Privacy And Data Boundary

This page explains what SourceHarbor's public repository should and should not expose.

## Allowed Public Material

- source code
- public contracts
- sanitized samples
- documentation that explains behavior and boundaries

## Material That Must Stay Private

- secrets and tokens
- personal inbox contents
- customer or operator data
- raw runtime logs with sensitive identifiers
- private failure evidence that cannot be safely sanitized

## Reading Rule

If you are evaluating the repo:

- public screenshots explain surfaces
- public proof pages explain the verification ladder
- private or runtime-only evidence must not be inferred from missing files

The boundary matters because a trustworthy open repository is not the same thing as a data dump.
