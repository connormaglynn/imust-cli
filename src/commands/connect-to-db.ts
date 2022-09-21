import { Command } from 'commander'
import config from '../config'
import { scriptServiceBuilder } from '../services/scriptService'

export const decorateConnectToDbCommand = (command: Command) => {
  command
    .description('Connect to a database within a Kubernetes cluster')
    .argument('<namespace>', 'The namespace that has access to the database')
    .option(
      '--db-secret <name>',
      'The name of the secret with the database connection details', 'dps-rds-instance-output'
    )
    .option(
      '--db-secret-address <name>',
      'The name of the secret with the database address',
    'rds_instance_address'
    )
    .action(runScript(config.scripts.connectToDb))

  return command
}

export const runScript =
  (scriptFileLocation: string) => (namespace: string, options: any) => {
    const script = scriptServiceBuilder(scriptFileLocation)
    script.setArgsIfPresent([
      namespace,
      options?.dbSecret,
      options?.dbSecretAddress,
    ])
    script.execute()
    script.logConsoleData()
  }
