#!/usr/bin/env node
const config = require('./config')
const { createCommand } = require('commander');
const { scriptServiceBuilder } = require('./scriptService')

console.log(config.program.name)

createCommand()
  .version(config.program.version)
  .description(config.program.description)
  .name(config.program.name)
  .addCommand(createCommand('connect-to-db')
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
    .action((namespace, options) => {
      const script = scriptServiceBuilder(config.scripts.connectToDb)
      script.setArgsIfPresent([
        namespace,
        options?.dbSecret,
        options?.dbSecretAddress,
      ])
      script.execute()
      script.logConsoleData()
    })
  )
  .parse(process.argv)
