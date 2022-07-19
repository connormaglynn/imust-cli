import { decorateHelloCommand } from './hello'
import { decorateConnectToDbCommand } from './connect-to-db'
import { createCommand } from 'commander'

export const commands = [
  decorateHelloCommand(createCommand('hello')),
  decorateConnectToDbCommand(createCommand('connect-to-db')),
]
