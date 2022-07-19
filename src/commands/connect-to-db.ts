import { Command } from 'commander'
import config from '../config'
import { scriptServiceBuilder } from '../services/scriptService'

export const decorateConnectToDbCommand = (command: Command) => {
  command
    .description('Connect to a database within a Kubernetes cluster')
    .argument('<namespace>', 'The namespace that has access to the database')
    .option(
      '--secret-with-db-connection-details',
      'The name of the secret with the database connection details'
    )
    .option(
      '--secret-with-db-address',
      'The name of the secret with the database address'
    )
    .action(runScript(config.scripts.connectToDb))

  return command
}

export const runScript =
  (scriptFileLocation: string) => (namespace: string, options: any) => {
    const script = scriptServiceBuilder(scriptFileLocation)
    script.setArgsIfPresent([
      namespace,
      options?.secretWithDbConnectionDetails,
      options?.secretWithDbAddress,
    ])
    script.execute()
    script.logConsoleData()
  }
