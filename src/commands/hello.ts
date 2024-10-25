import { Command } from 'commander'

export const decorateHelloCommand = (command: Command) => {
  command.command('world').action(() => {
    console.log('Hello World...')
  })

  return command
}
