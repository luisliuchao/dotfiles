# Auto Assign Action

An action which adds reviewers to the pull request when the pull requests are labeled.

Create a separate configuration file for the auto-assign action (e.g. `.github/auto_assign.yml`).

```yaml
# A list of reviewers, split into different froups, to be added to pull requests (GitHub user name) alternatively
# groups:
#   groupA:
#     - reviewerA
#   groupB:
#     - reviewerB
```

MIT
