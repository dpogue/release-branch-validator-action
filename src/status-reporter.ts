import * as core from "@actions/core";
import * as github from "@actions/github";
import * as errors from "./errors";

type GHClientType = ReturnType<typeof github.getOctokit>;

export function reportStatus(ghClient : GHClientType, err : Error) {
  const prNumber = github.context.payload.pull_request && github.context.payload.pull_request.number;
  if (!prNumber) {
    core.setFailed(err.message);
    return;
  }

  const strict = core.getBooleanInput('strict');
  if (strict) {
    // Fail the status check
    core.setFailed(err.message);
  } else {
    core.error(err.message);
  }

  if (err instanceof errors.MissingIssueError) {
    ghClient.rest.pulls.createReview({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      pull_number: prNumber,
      body: `The following commits are missing Jira issue references:\n\n${err.commits.map(sha => '* '+sha+'\n')}`,
      event: 'COMMENT'
    });
  }

  if (err instanceof errors.MissingLabelError) {
    ghClient.rest.pulls.createReview({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      pull_number: prNumber,
      body: `The following Jira issues are missing or have incorrect release labels:\n\n${err.issues.map(id => '* '+id+'\n')}`,
      event: 'COMMENT'
    });
  }

  if (err instanceof errors.InconsistentReleasesError) {
    ghClient.rest.pulls.createReview({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      pull_number: prNumber,
      body: `This pull request include Jira issues from multiple releases: ${err.labels.join(', ')}`,
      event: 'COMMENT'
    });
  }

  if (err instanceof errors.IncorrectTargetBranchError) {
    ghClient.rest.pulls.createReview({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      pull_number: prNumber,
      body: `According to Jira issue labels, this pull request should be targeting the \`${err.intendedTarget}\` branch.\n\nPlease double check your base branch!`,
      event: 'COMMENT'
    });
  }
}
