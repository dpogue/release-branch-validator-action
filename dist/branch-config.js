import * as core from "@actions/core";
import * as github from "@actions/github";
import * as yaml from "js-yaml";
import { ConfigFileError } from "./errors";
function parseYaml(fileData) {
    return yaml.load(fileData);
}
function getConfigFile(ghClient, filepath) {
    return ghClient.rest.repos.getContent({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        path: filepath,
        ref: github.context.sha
    })
        .then((resp) => Buffer.from(resp.data.content, resp.data.encoding).toString());
}
export function getBranchMappings(ghClient) {
    try {
        const configPath = core.getInput("configuration-path", { required: true });
        return getConfigFile(ghClient, configPath)
            .then(parseYaml)
            .catch((err) => {
            return Promise.reject(new ConfigFileError(`Unable to parse configuration-path file: ${configPath}\n\n${err.message}`));
        });
    }
    catch (err) {
        return Promise.reject(new ConfigFileError(err.message));
    }
}
export function getTargetBranch(ghClient) {
    const prNumber = github.context.payload.pull_request && github.context.payload.pull_request.number;
    if (!prNumber) {
        return Promise.reject(new Error("Unable to determine pull request from workflow context"));
    }
    return ghClient.rest.pulls.get({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        pull_number: prNumber
    })
        .then(response => response.data)
        .then(prData => prData.base.ref);
}
//# sourceMappingURL=branch-config.js.map