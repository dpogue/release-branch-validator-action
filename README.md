Release Branch Validator
========================

A GitHub Action step to validate that a pull request is opened against the correct branch based on branch mappings from the PR's referenced Jira issue labels.


Usage
-----

See also [action.yml](./action.yml) for a comprehensive list of all the options.

You **must** set up [a branch mapping Yaml file](#configuration-path) in your repository.

Example workflow configuration:

```yaml
name: PR Validation
on: [pull_request]

jobs:
  release-branch-validate:
    runs-on: ubuntu-latest
    steps:
      - uses: dpogue/release-branch-validator-action@v1
        with:
          jira-endpoint: ${{ secrets.JIRA_ENDPOINT }}
          jira-token: ${{ secrets.JIRA_AUTH_TOKEN }}
```


All Options
-----------

### List of input options

| Input                                       | Description                                                 | Default                         |
| ------------------------------------------- | ----------------------------------------------------------- | ------------------------------- |
| [repo-token](#repo-token)                   | PAT for GitHub authentication                               | `${{ github.token }}`           |
| [configuration-path](#configuration-path)   | Path to branch mapping configuration file                   | `.github/release-branches.yml`  |
| [jira-endpoint](#jira-endpoint)             | **Required.** The endpoint URL for the Jira instance        |                                 |
| [jira-token](#jira-token)                   | **Required.** An authentication token for the Jira instance |                                 |
| [strict](#strict)                           | Whether to fail the status check when problems are found    | `false`                         |

### Detailed Options

#### repo-token

Personal Access Token (PAT) that allows the workflow to authenticate and perform API calls to GitHub.  
Under the hood, it uses the [@actions/github](https://www.npmjs.com/package/@actions/github) package.

Default value: `${{ github.token }}`


#### configuration-path

The path to a Yaml mapping file in the default branch of the repository that contains a list of branches and corresponding Jira labels.

An example of this file would look like this:

```yaml
v1.x:
  - Backport

main:
  - Bugfix

next:
  - NewWork
```

With this example, pull requests referencing Jira issues with the `Backport` label will warn if they are not opened against the `v1.x` branch.

Default value: `.github/release-branches.yml`


#### jira-endpoint

The endpoint URL for the Jira instance from which to query issues and labels.

This value is required.


#### jira-token

An authentication token for the Jira instance.

This should be a base64-encoded value, consisting of a Jira user's email address and a valid API token value for that user.  
See [Atlassian instructions](https://developer.atlassian.com/cloud/jira/platform/basic-auth-for-rest-apis/#supply-basic-auth-headers) for generating this value.

This value is required, and should be stored in the repository secrets.


#### strict

By default, this action will add comments to a pull request warning about problems such as missing Jira issues in commits, inconsistent or missing release labelling on those issues, and whether the pull request is targeting the wrong base branch. However, it will not mark the status check as failing.

When setting `strict` to `true`, any problem will also cause a failing status check on the pull request to prevent it from being merged.

Default value: `false`


Contributing
------------

Contributions of bug reports, feature requests, and pull requests are greatly appreciated!

Please note that this project is released with a [Contributor Code of Conduct](https://github.com/dpogue/release-branch-validator-action/blob/master/CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

Licence
-------

Copyright © 2021 Darryl Pogue.  
Licensed under the MIT Licence.
