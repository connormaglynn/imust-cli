#!/usr/bin/env node
import config from './config'
import { commands } from './commands'
import { createCommand } from 'commander'

console.log(config.program.name)

const program = createCommand()

program
  .version(config.program.version)
  .description(config.program.description)
  .name(config.program.name)

commands.forEach((command) => program.addCommand(command))

program.parse(process.argv)
