import * as core from '@actions/core'
import _ from 'lodash'
import * as github from '@actions/github'
import * as yaml from 'js-yaml'
import { Config } from './handler'

export function chooseReviewers(config: Config): string[] {
  const { groups, runNumber } = config
  const groupKeys = Object.keys(groups)
  const numberOfGroups = groupKeys.length
  const groupIndex = runNumber % numberOfGroups
  return groups[groupKeys[groupIndex]]
}

export async function fetchConfigurationFile(client: github.GitHub, options) {
  const { owner, repo, path, ref } = options
  const result = await client.repos.getContents({
    owner,
    repo,
    path,
    ref,
  })

  const data: any = result.data

  if (!data.content) {
    throw new Error('the configuration file is not found')
  }

  const configString = Buffer.from(data.content, 'base64').toString()
  const config = yaml.safeLoad(configString)

  return config
}
