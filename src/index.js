#!/usr/bin/env node
const { createCommand } = require('commander');
const path = require('path')
const { spawn } = require('child_process')

const config = {
  program: {
    name: 'IMust',
    version: '0.1.0',
    description: 'A command line tool for developers',
  },
  scripts: {
    location: path.resolve(__dirname, '../scripts/'),
    connectToDb: 'connect-to-db.sh',
  },
}

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
