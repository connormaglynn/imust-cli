import chalk from 'chalk'
import { Command } from 'commander'

export const decorateHelloCommand = (command: Command) => {
  command.command('world').action(() => {
    console.log(chalk.green('Hello World...'))
  })

  return command
}
