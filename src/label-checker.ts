import * as core from "@actions/core";
import { IBranchMapping } from "./branch-config";
import { IIssueLabelMapping } from "./issue-fetcher";
import { MissingLabelError, InconsistentReleasesError, IncorrectTargetBranchError } from "./errors";

export function checkLabels([branchMap, issueLabels, targetBranch] : [IBranchMapping, IIssueLabelMapping, string]) {
  // List of all the labels that are mapped to release branches
  const releaseMap = Object.keys(branchMap).flatMap(k => branchMap[k].map(b => [b, k])) as Array<[string, string]>;
  const releaseLabels = releaseMap.map(([label, branch]) => label);

  // Filter each issue's labels to only include ones mapped to releases
  const issuesByRelease = issueLabels.map<[string, Array<string>]>(([id, labels]) => [id, labels.filter(l => releaseLabels.includes(l))]);

  // Error if issues do not have exactly 1 release label
  const unlabelledIssues = issuesByRelease.filter(([id, labels]) => labels.length !== 1).map(([id, labels]) => id);
  if (unlabelledIssues.length > 0) {
    return Promise.reject(new MissingLabelError("Some Jira issues have incorrect release labels", unlabelledIssues));
  }

  const releases = [...new Set(issuesByRelease.map(([id, labels]) => labels[0]))];

  if (releases.length !== 1) {
    return Promise.reject(new InconsistentReleasesError("Inconsistent release labelled for included issues", releases));
  }

  const intendedBranch = releaseMap.filter(([label, branch]) => label === releases[0]).map(([label, branch]) => branch)[0];
  core.debug(`This PR should be targeting the branch ${intendedBranch} and is targeting ${targetBranch}`);

  if (intendedBranch !== targetBranch) {
    return Promise.reject(new IncorrectTargetBranchError(intendedBranch));
  }
}
