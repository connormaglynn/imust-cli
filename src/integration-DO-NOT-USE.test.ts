import path from 'path'
import { exec } from 'child_process'

// WARNING: these tests are used to test the integration with the local environment.
// They will connect to a database within a live Kubernetes cluster if ran locally and kubectl is configured.
// They are not meant to be run in a production environment.
// They are not meant to be run in a CI environment.
describe.skip('integration tests', () => {
  class CliTestRunner {
    constructor(public fileName: string) {
      return this
    }

    async runWith(
      args: string[]
    ): Promise<{ code: number; error: any; stdout: any; stderr: string }> {
      return new Promise((resolve) => {
        exec(
          `npx ts-node ${path.resolve(this.fileName)} ${args.join(' ')}`,
          {},
          (error, stdout, stderr) => {
            resolve({
              code: error && error.code ? error.code : 0,
              error,
              stdout,
              stderr,
            })
          }
        )
      })
    }
  }

  const imustCommand = new CliTestRunner('./src/index.ts')

  it('should print hello world when [hello world] is passsed', async () => {
    const result = await imustCommand.runWith(['hello', 'world'])

    expect(result.stdout).toContain('Hello World...')
    expect(result.code).toBe(0)
  })

  it('should spawn connect-to-db', async () => {
    jest.setTimeout(10000)
    const result = await imustCommand.runWith([
      'connect-to-db',
      'manage-soc-cases-dev',
    ])

    expect(result).toContain('Hello World...')
    expect(result.code).toBe(0)
  }, 60000)
})
