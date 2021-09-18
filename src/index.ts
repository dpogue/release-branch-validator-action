import * as core from "@actions/core";
import * as github from "@actions/github";
import { getBranchMappings, getTargetBranch } from "./branch-config";
import { getCommitIssueLabels } from "./issue-fetcher";
import { checkLabels } from "./label-checker";
import { reportStatus } from "./status-reporter";

try {
  const token = core.getInput("repo-token", { required: true });
  const client = github.getOctokit(token);

  Promise.all([ getBranchMappings(client), getCommitIssueLabels(client), getTargetBranch(client) ])
    .then(checkLabels)
    .catch(reportStatus.bind(null, client));
} catch(err : any) {
  core.setFailed(err.message);
}
