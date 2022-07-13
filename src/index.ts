#!/usr/bin/env node

import config from "./config";

import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";
import path from "path";
import { program } from "commander";

clear();
console.log(
  chalk.red(figlet.textSync(config.program.name, { horizontalLayout: "full" }))
);

program
  .version(config.program.version)
  .description(config.program.description)
  .name(config.program.name);

const hello = program.command("hello");

hello.command("world").action(() => {
  console.log(chalk.green("Hello World..."));
});

program.parse(process.argv);
