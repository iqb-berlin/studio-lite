# Schemer 2.9.0 test module

`iqb-schemer-2.9.0.html.gz` is the immutable standalone module built from the
Coding Components commit in the sibling provenance file. It is used only by
`schemer-rich-text.cy.ts`; Studio's application builds do not include it.

The Cypress `readSchemerFixture` task verifies both archive and original HTML
SHA-256 checksums, decompresses in memory and uploads the original module through
the normal API. It needs neither a download nor write access to the fixture
directory, which is mounted read-only in the e2e container.

Keep the generated module as a compressed test artifact. Checking its bundled
third-party JavaScript in as application source produced 15 CodeQL annotations:
13 escaping reports in MathLive/KaTeX, a MathLive character-class report and the
Verona module's wildcard parent-window messaging. Those reports need the original
source and its calling context to assess; archiving the fixture does not fix or
establish vulnerabilities in those upstream libraries. Studio's CodeQL workflow,
queries and source coverage are unchanged.

To reproduce the archive from the original build output:

```sh
gzip -n -9 -c iqb-schemer-2.9.0.html > iqb-schemer-2.9.0.html.gz
```

Verify the decompressed HTML against `sha256` in the provenance file before
updating either digest. Preserve the original bundle bytes, including whitespace.
