# See It Fast

If the README is the front door, this page is the shop window.

The goal here is simple:

1. show what SourceHarbor looks like
2. show what comes out of it
3. let you decide whether it is worth a deeper evaluation

<p>
  <img
    src="./assets/sourceharbor-hero.svg"
    alt="SourceHarbor first-look preview showing the command center, digest feed, and job trace surfaces."
    width="100%"
  />
</p>

## The 20-Second Mental Model

SourceHarbor is not just a summarizer.

It is a full intake-to-digest loop:

- sources come in from YouTube, Bilibili, and RSS
- a job-backed pipeline processes each item
- operators read the result in a digest flow
- agents reuse the same evidence through API and MCP

## The Three Surfaces That Matter First

### 1. Command Center

This is the operator home base.

What you should picture:

- subscription count
- discovered videos
- queued and failed jobs
- one place to trigger intake and inspect recent activity

Why it matters:

- it turns the repo from "a bunch of scripts" into a usable operating surface

### 2. Digest Feed

This is the reading surface.

Representative current feed shape:

- title: `AI Weekly`
- source label: `YouTube · Tech Channel`
- category label: `Tech`
- body path: digest markdown plus artifact metadata

Why it matters:

- the output is meant to be read, not just stored

### 3. Job Trace

This is the evidence surface.

What you inspect here:

- `job_id`
- status and pipeline final status
- step summary
- retry count
- artifact references

Why it matters:

- when something fails, you can debug with receipts instead of guesswork

## What The Result Looks Like

SourceHarbor's digest artifact template already tells the story of the output shape:

```markdown
# <title>

> Source: [Original video](<source_url>)
> Platform: <platform> | Video ID: <video_uid> | Generated at: <generated_at>

## One-Minute Summary
<tldr>

## What This Covers
<summary>

## Key Takeaways
<highlights>
```

That is the key idea:

- not just transcript text
- not just one summary blob
- a reusable artifact with traceable structure

## The 60-Second Trust Path

If you want confidence without booting the full stack yet:

1. Read [README.md](../README.md) for the public story.
2. Read [proof.md](./proof.md) for the evidence ladder.
3. Read [architecture.md](./architecture.md) if you want the system map.

If you want a real local run after that, go to [start-here.md](./start-here.md).
