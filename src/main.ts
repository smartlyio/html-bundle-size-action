import * as core from '@actions/core'

import bundleSize from './bundle-size'

async function run(): Promise<void> {
  try {
    const path: string = core.getInput('path')
    const base: string = core.getInput('base')
    const size = await bundleSize({path, base})
    core.setOutput('size', size)
    process.exit(0)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
