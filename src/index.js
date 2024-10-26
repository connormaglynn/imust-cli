#!/usr/bin/env node
const { createCommand } = require('commander');
const config = require('./config')
const { spawn } = require('child_process')

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
      const args = [
        namespace,
        options?.dbSecret,
        options?.dbSecretAddress,
      ]
      const argsIfSet = args.filter((arg) => arg !== undefined && arg !== null)

      const childProcess = spawn(`${config.scripts.location}/${config.scripts.connectToDb}`, argsIfSet, { stdio: 'inherit' })
      process.on('SIGINT', () => {
        console.log('Caught Ctrl-C. Sending SIGINT to child process...');
        childProcess.kill('SIGINT');
      });
    })
  )
  .parse(process.argv)
