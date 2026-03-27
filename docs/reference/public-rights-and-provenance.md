# Public Rights And Provenance

This page explains the rights boundary for the public SourceHarbor repository.

## What Is In Scope

- repository source code
- tracked documentation
- generated public-facing contracts that ship with the repo
- sanitized sample assets that are explicitly marked as public

## What Is Out Of Scope

- private credentials
- operator mailboxes
- customer data
- unpublished runtime artifacts
- local agent workspaces
- unreviewed third-party media or logs

## Provenance Rule

Public readers should assume:

- tracked source files are the canonical public implementation
- generated proof pages are summaries, not replacements for source truth
- third-party licenses are summarized in [THIRD_PARTY_NOTICES.md](../../THIRD_PARTY_NOTICES.md)
- file-level public presentation asset status is tracked in [public-assets-provenance.md](./public-assets-provenance.md)

When rights or provenance are unclear, the safer reading is:

- do not treat the material as redistributable until the repo says so explicitly
