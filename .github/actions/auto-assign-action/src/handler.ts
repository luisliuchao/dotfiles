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
  webhook: string // from secrets.SLACK_WEBHOOK
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
  const pr = new PullRequest(client, context, config.webhook)

  try {
    const reviewers = utils.chooseReviewers(config)

    if (reviewers.length > 0) {
      await pr.addAssignees(reviewers)

      const msg = `Added reviewers to PR #${number}: ${reviewers.join(
        ', '
      )} with run number ${config.runNumber}`
      core.info(msg)

      // send msg to slack
      await pr.postMessage(msg)
    }
  } catch (error) {
    core.warning(error.message)
    pr.postMessage(error.message)
  }
}
