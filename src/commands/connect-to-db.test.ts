import { Command, createCommand } from 'commander'
import * as connectToDb from './connect-to-db'
import * as ScriptServiceModule from '../services/scriptService'
import {Mocked, mocked, MockInstance} from 'jest-mock'

jest.mock('../services/scriptService')
jest.mock('../config', () => ({ scripts: { connectToDb: 'connect-to-db' } }))

let command: Command
let decoratedCommand: Command

describe('ConnectToDb', () => {
  describe('decorateConnectToDbCommand', () => {
    beforeEach(() => {
      command = createCommand('connect-to-db')
    })

    describe('decorateConnectToDbCommand - args, options and config', () => {
      beforeEach(() => {
        decoratedCommand = connectToDb.decorateConnectToDbCommand(command)
      })

      it('should set the description', () => {
        expect(decoratedCommand.description()).toBe(
          'Connect to a database within a Kubernetes cluster'
        )
      })

      it('should set only 1 agrument', () => {
        // @ts-ignore
        expect(decoratedCommand._args.length).toEqual(1)
      })

      it('should set a namespace argument first', () => {
        // @ts-ignore
        expect(decoratedCommand._args[0]).toEqual(
          expect.objectContaining({
            description: 'The namespace that has access to the database',
            defaultValue: undefined,
            required: true,
            _name: 'namespace',
          })
        )
      })

      it('should set two options', () => {
        // @ts-ignore
        expect(decoratedCommand.options.length).toEqual(2)
      })

      it('should set first option as --secret-with-db-connection-details', () => {
        // @ts-ignore
        expect(decoratedCommand.options[0]).toEqual(
          expect.objectContaining({
            description: 'The name of the secret with the database connection details',
            defaultValue: 'dps-rds-instance-output',
            required: true,
            long: '--db-secret',
            flags: '--db-secret <name>',
          })
        )
      })

      it('should set second option as --secret-with-db-address', () => {
        // @ts-ignore
        expect(decoratedCommand.options[1]).toEqual(
          expect.objectContaining({
            description: 'The name of the secret with the database address',
            defaultValue: 'rds_instance_address',
            required: true,
            long: '--db-secret-address',
            flags: '--db-secret-address <name>',
          })
        )
      })
    })

    describe('decorateConnectToDbCommand - action', () => {
      beforeEach(() => {
        jest.spyOn(connectToDb, 'runScript')
        jest.spyOn(command, 'action')

        connectToDb.decorateConnectToDbCommand(command)
      })

      it('should set the action', () => {
        expect(command.action).toBeCalledTimes(1)
      })

      it('should call run runscript with config value', () => {
        expect(connectToDb.runScript).toBeCalledTimes(1)
        expect(connectToDb.runScript).toBeCalledWith('connect-to-db')
      })
    })
  })

  describe('runScript', () => {
    let mockedScriptServiceModule: Mocked<typeof ScriptServiceModule>
    let mockedScriptService: Mocked<any>
    let mockedScriptServiceBuilder: MockInstance

    beforeEach(() => {
      mockedScriptServiceModule = mocked(ScriptServiceModule, {shallow: true})

      mockedScriptService = mocked(
        mockedScriptServiceModule.ScriptService,
          {shallow: true}
      ).mockImplementation(
        // @ts-ignore
        () => {
          return {
            execute: jest.fn().mockReturnThis(),
            logConsoleData: jest.fn(),
            setArgsIfPresent: jest.fn().mockReturnThis(),
          }
        }
      )

      mockedScriptService = mockedScriptService()

      mockedScriptServiceBuilder = mocked(
        mockedScriptServiceModule.scriptServiceBuilder,
          {shallow: true}
      ).mockImplementation(
        // @ts-ignore
        () => {
          return mockedScriptService
        }
      )

      connectToDb.runScript('testingDir')('namespace', {
        dbSecret: 'db-secret',
        dbSecretAddress: 'db-secret-address',
      })
    })

    it('should call scriptServiceBuilder', () => {
      expect(mockedScriptServiceBuilder).toBeCalledTimes(1)
      expect(mockedScriptServiceBuilder).toBeCalledWith('testingDir')
    })

    it('should call ScriptService.setArgsIfPresent', () => {
      expect(mockedScriptService.setArgsIfPresent).toBeCalledTimes(1)
      expect(mockedScriptService.setArgsIfPresent).toBeCalledWith([
        'namespace',
        'db-secret',
        'db-secret-address',
      ])
    })

    it('should call ScriptService.execute', () => {
      expect(mockedScriptService.execute).toBeCalledTimes(1)
      expect(mockedScriptService.execute).toBeCalledWith()
    })
  })
})
