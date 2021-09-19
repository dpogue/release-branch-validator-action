import * as core from "@actions/core";
import * as github from "@actions/github";
import * as httpm from "@actions/http-client";
import { MissingIssueError } from "./errors";
const jiraIssueRegex = /([a-zA-Z0-9]+-[0-9]+)/g;
function getCommits(ghClient) {
    const prNumber = github.context.payload.pull_request && github.context.payload.pull_request.number;
    if (!prNumber) {
        return Promise.reject(new Error("Unable to determine pull request from workflow context"));
    }
    return ghClient.rest.pulls.listCommits({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        pull_number: prNumber
    })
        .then(response => response.data);
}
function mapCommitsToIssueIDs(commits) {
    return commits.map(commit => [commit.sha, commit.commit.message.match(jiraIssueRegex)]);
}
function validateIssues(commits) {
    const missingRefs = commits.filter(([sha, issues]) => issues === null).map(([sha, issues]) => sha);
    if (missingRefs.length > 0) {
        throw new MissingIssueError("Some commits are missing Jira issue references", missingRefs);
    }
    // Return the unique list of all referenced issue IDs
    return [...new Set(commits.reduce((acc, [sha, commits]) => acc.concat(commits || []), []))];
}
function requestJiraIssues(issues) {
    const jiraEndpoint = core.getInput("jira-endpoint", { required: true });
    const jiraAuthToken = core.getInput("jira-token", { required: true });
    const http = new httpm.HttpClient();
    return http.postJson(`${jiraEndpoint}/rest/api/2/search`, {
        jql: `issuekey in (${issues.join(',')})`,
        fields: ["key", "labels"]
    }, {
        Authorization: `Basic ${jiraAuthToken}`
    })
        .then(response => {
        if (response.statusCode !== 200) {
            return Promise.reject(new Error("Jira request failed: " + JSON.stringify(response.result)));
        }
        else {
            return response.result;
        }
    });
}
function mapIssuesToLabels(response) {
    return response.issues.map(issue => [issue.key, (issue.fields && issue.fields.labels) || []]);
}
export function getCommitIssueLabels(ghClient) {
    return getCommits(ghClient)
        .then(mapCommitsToIssueIDs)
        .then(validateIssues)
        .then(requestJiraIssues)
        .then(mapIssuesToLabels);
}
//# sourceMappingURL=issue-fetcher.js.map