# Auto Assign Action

An action which adds reviewers to the pull request when the pull request is opened.

Create a separate configuration file for the auto-assign action (e.g. `.github/auto_assign.yml`).

```yaml
# A list of reviewers, split into different froups, to be added to pull requests (GitHub user name) alternatively
# groups:
#   groupA:
#     - reviewerA
#     - reviewerB
#     - reviewerC
#   groupB:
#     - reviewerD
#     - reviewerE
#     - reviewerF
```

MIT
