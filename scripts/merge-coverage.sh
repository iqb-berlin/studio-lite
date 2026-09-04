#!/bin/bash

# Builds one coverage report over every test project of this workspace, above the reports they
# each wrote.
#
# What the merged report is, and what it is not: each project measures its own sources and only
# those (see `collectCoverageFrom` in the four jest configs), so the merge is the number for the
# workspace as a whole -- useful to link to, and the only place where the four parts are weighted
# against each other by size. It is not a way to see a library through the eyes of the applications:
# a measured run showed no file of libs/ in either application report, with or without
# `collectCoverageFrom`, because jest discovers files below its roots only. What libs/ is worth is
# what its own suite says, and that is the part to read before deciding whether something needs a
# test.
#
# Where things end up: the parts under coverage/by-project/<project>/, the merge under
# coverage/all/. Both are wiped and rewritten here, so nothing of a previous run survives into a
# later one -- which also keeps the merge off the paths jest writes to (coverage/apps/<name>,
# coverage/libs/<name>), whose html would otherwise be overwritten by html of the same name from
# the merged tree.
#
# An e2e report is taken along if one is lying at coverage/by-project/e2e/. Nothing in this
# repository writes one today; the e2e suite needs a database, and collecting its coverage is a
# separate piece of work (see issue #1624). Whoever picks it up finds the merge ready for it.
#
# Usage: scripts/merge-coverage.sh   (after the four runs, see npm run test-app-coverage)

set -euo pipefail

projects=(apps/api apps/frontend libs/iqb-components libs/shared-code)
by_project="coverage/by-project"
merged="coverage/all"
merge_dir="coverage/.merge"
e2e_report="${by_project}/e2e/coverage-final.json"

rm -rf "${merge_dir}" "${merged}"
mkdir -p "${merge_dir}" "${by_project}"

for project in "${projects[@]}"; do
  name="$(basename "${project}")"
  report="coverage/${project}/coverage-final.json"
  if [ ! -f "${report}" ]; then
    echo "No coverage report for ${name} at ${report} - run npm run test-app-coverage first." >&2
    exit 1
  fi
  cp "${report}" "${merge_dir}/${name}.json"
  rm -rf "${by_project}/${name}"
  mv "coverage/${project}" "${by_project}/${name}"
done

# The now empty apps/ and libs/ below coverage/, so that the next run starts on an empty directory
# rather than on the html of files that have since been deleted.
rm -rf coverage/apps coverage/libs

if [ -f "${e2e_report}" ]; then
  cp "${e2e_report}" "${merge_dir}/e2e.json"
  # This report is not from this run: whoever last collected it left it there, and it stays until
  # the next one. A report from last week merges in just as quietly.
  echo "Merging the e2e report that is lying at ${by_project}/e2e/ in as well."
else
  echo "No e2e report at ${e2e_report} - merging the unit runs only." >&2
fi

# nyc reads every json in --temp-dir and adds them up.
npx nyc report \
  --temp-dir "${merge_dir}" \
  --report-dir "${merged}" \
  --reporter html \
  --reporter text-summary

rm -rf "${merge_dir}"
