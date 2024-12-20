#!/usr/bin/env node
const { createCommand } = require('commander');
const { spawnSync, spawn } = require('child_process')
const readline = require('node:readline');

const config = {
  program: {
    name: 'IMust',
    version: '0.1.1',
    description: 'A command line tool for developers',
  },
}

const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs))
const getInput = (question) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer)
      rl.close()
    })
  })
}

createCommand()
  .version(config.program.version)
  .description(config.program.description)
  .name(config.program.name)
  .addCommand(createCommand('connect-to-db')
    .description('Connect to a database within a Kubernetes cluster')
    .argument('<namespace>', 'The namespace that has access to the database')
    .option(
      '--db-secret <name>',
      'The name of the secret with the database connection details',
      'rds-instance-output'
    )
    .option(
      '--db-secret-address <name>',
      'The name of the secret with the database address',
      'rds_instance_address'
    )
    .option(
      '--local-port <port>',
      'The local port to forward the database connection to',
      '5433'
    )
    .action(async (namespace, options) => {
      const databaseSecret = options.dbSecret
      const databaseAddressKey = options.dbSecretAddress
      const localPort = options.localPort

      const whichKubeCtl = spawnSync('which', ['kubectl'], { encoding: 'utf-8' })
      if (whichKubeCtl.status !== 0) {
        console.error('😱 Error checking kubectl exists:', whichKubeCtl.stderr)
        process.exit(1)
      }

      var { status, stdout, stderr } = spawnSync('kubectl', ['get', 'namespaces', namespace], { encoding: 'utf-8' })
      if (status) {
        console.error('😱 Error checking namespace exists:', stderr)
        process.exit(1)
      }

      var { status, stdout, stderr } = spawnSync('kubectl', ['--namespace', namespace, 'get', 'secret', databaseSecret, '-o', 'json'], { encoding: 'utf-8' })
      if (status) {
        console.error(`😱 Error getting secret ${databaseSecret}:`, stderr)
        process.exit(1)
      }
      const databseConnectionDetails = JSON.parse(stdout).data
      const databaseAddress = Buffer.from(databseConnectionDetails[databaseAddressKey], 'base64').toString()
      const database_name = Buffer.from(databseConnectionDetails.database_name, 'base64').toString()
      const database_username = Buffer.from(databseConnectionDetails.database_username, 'base64').toString()
      const database_password = Buffer.from(databseConnectionDetails.database_password, 'base64').toString()

      var { status, stdout, stderr } = spawnSync('kubectl', ['--namespace', namespace, 'get', 'pods', 'port-forward-pod'], { encoding: 'utf-8' })
      if (status) {
        var { status, stdout, stderr } = spawnSync(
          'kubectl',
          [
            '--namespace', namespace,
            'run', 'port-forward-pod',
            '--image=ministryofjustice/port-forward',
            `--env=REMOTE_HOST=${databaseAddress}`,
            '--env=REMOTE_PORT=5432',
            '--env=LOCAL_PORT=5432'
          ],
          { encoding: 'utf-8' }
        )
        if (status) {
          console.error('😱 Error creating port-forward-pod:', stderr)
          process.exit(1)
        }
        await sleep(3000)
        console.log(`✅ "port-forward-pod" has been successfully created in "${namespace}".`)
      } else {
        console.log(`✅ "port-forward-pod" already exists in "${namespace}".`)
      }

      var input = 'r'
      var portForwardProcess
      while (input === 'r') {
        portForwardProcess = spawn('kubectl', ['--namespace', namespace, 'port-forward', 'port-forward-pod', `${localPort}:5432`], { encoding: 'utf-8' })
        await sleep(1000)
        console.log(`✅ Forwarding traffic from "localhost:${localPort}" to RDS Database at "${databaseAddress}:5432"...`)

        console.log(`📣 You can now connect to the RDS database using your local database client by using the following details:
  - Database Name:         ${database_name}
  - Database Username:     ${database_username}
  - Database Password:     ${database_password}
  - Local Port:            ${localPort}

💡 Note: Ensure your database client is set to connect to localhost:${localPort}.
`)


        input = await getInput('Enter `r` to restart port-forwarding or any other key to exit: ')
      }

      console.log('👋 Closing port-forwarding and cleaning up resources...');
      portForwardProcess.kill()
      var { status, stdout, stderr } = spawnSync('kubectl', ['--namespace', namespace, 'delete', 'pod', 'port-forward-pod'], { encoding: 'utf-8' })
      if (status) {
        console.error('😱 Error deleting port-forward-pod:', stderr)
        process.exit(1)
      }
      console.log(`✅ "port-forward-pod" has been deleted in "${namespace}".`)
      return
    })
  )
  .parse(process.argv)
