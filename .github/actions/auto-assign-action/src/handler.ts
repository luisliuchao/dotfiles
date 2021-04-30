import * as core from '@actions/core'
import * as github from '@actions/github'
import { Context } from '@actions/github/lib/context'
import * as utils from './utils'
import { PullRequest } from './pull_request'

export interface Config {
  filterLabels?: {
    include?: string[]
    exclude?: string[]
  }
  groups: { [key: string]: string[] }
  runNumber: number // from github.run_number
}

export async function handlePullRequest(
  client: github.GitHub,
  context: Context,
  config: Config
) {
  if (!context.payload.pull_request) {
    throw new Error('the webhook payload is not exist')
  }

  const { title, draft, user, number } = context.payload.pull_request
  const { filterLabels, groups } = config

  const owner = user.login
  const pr = new PullRequest(client, context)

  if (filterLabels !== undefined) {
    if (filterLabels.include !== undefined && filterLabels.include.length > 0) {
      const hasLabels = pr.hasAnyLabel(filterLabels.include)
      if (!hasLabels) {
        core.info(
          'Skips the process to add reviewers since PR is not tagged with any of the filterLabels.include'
        )
        return
      }
    }

    if (filterLabels.exclude !== undefined && filterLabels.exclude.length > 0) {
      const hasLabels = pr.hasAnyLabel(filterLabels.exclude)
      if (hasLabels) {
        core.info(
          'Skips the process to add reviewers since PR is tagged with any of the filterLabels.exclude'
        )
        return
      }
    }
  }

  try {
    const reviewers = utils.chooseReviewers(config)

    if (reviewers.length > 0) {
      await pr.addAssignees(reviewers)
      core.info(`Added reviewers to PR #${number}: ${reviewers.join(', ')}`)
    }
  } catch (error) {
    core.warning(error.message)
  }
}
