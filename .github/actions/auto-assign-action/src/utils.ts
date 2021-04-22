import * as core from '@actions/core'
import _ from 'lodash'
import * as github from '@actions/github'
import * as yaml from 'js-yaml'
import { Config } from './handler'

export function chooseReviewers(owner: string, config: Config): string[] {
  const {
    useReviewGroups,
    reviewGroups,
    numberOfReviewers,
    reviewers,
    includeOwner,
  } = config
  let chosenReviewers: string[] = []
  const useGroups: boolean =
    useReviewGroups && Object.keys(reviewGroups).length > 0
  const filterUser = includeOwner ? '' : owner

  if (useGroups) {
    chosenReviewers = chooseUsersFromGroups(
      reviewGroups,
      numberOfReviewers,
      filterUser
    )
  } else {
    chosenReviewers = chooseUsers(reviewers, numberOfReviewers, filterUser)
  }

  return chosenReviewers
}

export function chooseAssignees(owner: string, config: Config): string[] {
  const {
    useAssigneeGroups,
    assigneeGroups,
    addAssignees,
    numberOfAssignees,
    numberOfReviewers,
    assignees,
    reviewers,
    includeOwner,
    useAlternateGroups,
    alternateGroups,
  } = config
  let chosenAssignees: string[] = []

  const useGroups: boolean =
    useAssigneeGroups && Object.keys(assigneeGroups).length > 0
  const filterUser = includeOwner ? '' : owner

  if (typeof addAssignees === 'string') {
    if (addAssignees !== 'author') {
      throw new Error(
        "Error in configuration file to do with using addAssignees. Expected 'addAssignees' variable to be either boolean or 'author'"
      )
    }
    chosenAssignees = [owner]
  } else if (useAlternateGroups) {
    const groupKeys = Object.keys(alternateGroups)
    chosenAssignees = chooseUsers(
      alternateGroups[groupKeys[0]],
      numberOfAssignees || numberOfReviewers,
      filterUser
    )
  } else if (useGroups) {
    chosenAssignees = chooseUsersFromGroups(
      assigneeGroups,
      numberOfAssignees || numberOfReviewers,
      filterUser
    )
  } else {
    const candidates = assignees ? assignees : reviewers
    chosenAssignees = chooseUsers(
      candidates,
      numberOfAssignees || numberOfReviewers,
      filterUser
    )
  }

  return chosenAssignees
}

export function chooseUsers(
  candidates: string[],
  desiredNumber: number,
  filterUser: string = ''
): string[] {
  const filteredCandidates = candidates.filter((reviewer: string): boolean => {
    return reviewer !== filterUser
  })

  // all-assign
  if (!desiredNumber) {
    return filteredCandidates
  }

  return _.sampleSize(filteredCandidates, desiredNumber)
}

export function includesSkipKeywords(
  title: string,
  skipKeywords: string[]
): boolean {
  for (const skipKeyword of skipKeywords) {
    if (title.toLowerCase().includes(skipKeyword.toLowerCase()) === true) {
      return true
    }
  }

  return false
}

export function chooseUsersFromGroups(
  groups: { [key: string]: string[] } | undefined,
  desiredNumber: number,
  filterUser: string
): string[] {
  let users: string[] = []
  for (const group in groups) {
    users = users.concat(chooseUsers(groups[group], desiredNumber, filterUser))
  }
  return users
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
