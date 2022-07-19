#!/usr/bin/env node
import config from './config'
import chalk from 'chalk'
import clear from 'clear'
import figlet from 'figlet'
import { commands } from './commands'
import { createCommand } from 'commander'

clear()
console.log(
  chalk.red(figlet.textSync(config.program.name, { horizontalLayout: 'full' }))
)

const program = createCommand()

program
  .version(config.program.version)
  .description(config.program.description)
  .name(config.program.name)

commands.forEach((command) => program.addCommand(command))

program.parse(process.argv)
