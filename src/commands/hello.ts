import chalk from "chalk"
import { Command } from "commander"

export const makeHelloCommand = () => {
  const command = new Command("hello")

  command.command("world").action(() => {
    console.log(chalk.green("Hello World..."))
  })

  return command
}
