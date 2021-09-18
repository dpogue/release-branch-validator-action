export class ConfigFileError extends Error { }

export class MissingIssueError extends Error {
  private _commits : Array<string> = [];

  constructor(message : string, commits : Array<string>) {
    super(message);
    this._commits = commits;
  }

  get commits() {
    return this._commits;
  }
}

export class MissingLabelError extends Error {
  private _issues : Array<string> = [];

  constructor(message : string, issues : Array<string>) {
    super(message);
    this._issues = issues;
  }

  get issues() {
    return this._issues;
  }
}

export class InconsistentReleasesError extends Error {
  private _labels : Array<string> = [];

  constructor(message : string, labels : Array<string>) {
    super(message);
    this._labels = labels;
  }

  get labels() {
    return this._labels;
  }
}

export class IncorrectTargetBranchError extends Error {
  private _intendedTarget : string;

  constructor(correctTarget : string) {
    super(`Incorrect pull request base branch: should be ${correctTarget}`);
    this._intendedTarget = correctTarget;
  }

  get intendedTarget() {
    return this._intendedTarget;
  }
}
