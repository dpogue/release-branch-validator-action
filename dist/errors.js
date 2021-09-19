export class ConfigFileError extends Error {
}
export class MissingIssueError extends Error {
    constructor(message, commits) {
        super(message);
        this._commits = [];
        this._commits = commits;
    }
    get commits() {
        return this._commits;
    }
}
export class MissingLabelError extends Error {
    constructor(message, issues) {
        super(message);
        this._issues = [];
        this._issues = issues;
    }
    get issues() {
        return this._issues;
    }
}
export class InconsistentReleasesError extends Error {
    constructor(message, labels) {
        super(message);
        this._labels = [];
        this._labels = labels;
    }
    get labels() {
        return this._labels;
    }
}
export class IncorrectTargetBranchError extends Error {
    constructor(correctTarget) {
        super(`Incorrect pull request base branch: should be ${correctTarget}`);
        this._intendedTarget = correctTarget;
    }
    get intendedTarget() {
        return this._intendedTarget;
    }
}
//# sourceMappingURL=errors.js.map