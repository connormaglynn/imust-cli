import * as childProcessModule from 'child_process'
import { ScriptService, scriptServiceBuilder } from './scriptService'
import config from '../config'
import { mocked, Mocked } from 'jest-mock'

jest.mock('../config')
jest.mock('child_process')

let mockDirectoryLocation: string
let mockScriptName: string
let mockChildProcess: Mocked<childProcessModule.ChildProcess>

beforeEach(() => {
  mockDirectoryLocation = '/testUtils'
  mockScriptName = 'dummyScript.sh'
  mockChildProcess = mocked(new childProcessModule.ChildProcess(), {shallow: true})

  config.scripts.location = mockDirectoryLocation
  jest.spyOn(childProcessModule, 'spawn').mockReturnValueOnce(mockChildProcess)
})

describe('scriptService', () => {
  describe('setAbsolutePathToScript', () => {
    it('should set the absolute path to the script with custom values', () => {
      const scriptService = new ScriptService(
        mockScriptName
      ).setAbsolutePathToScript('dir', 'name')

      expect(scriptService.pathToScript).toEqual('dir/name')
    })

    it('should return itself', () => {
      const scriptService = new ScriptService(mockScriptName)
      const scriptServiceWithAbsolutePath =
        scriptService.setAbsolutePathToScript('dir', 'name')

      expect(scriptService).toEqual(scriptServiceWithAbsolutePath)
    })
  })

  describe('setArgsIfPresent', () => {
    it('should set the args if present', () => {
      const scriptService = new ScriptService(mockScriptName)
      // @ts-ignore
      const scriptServiceWithArgs = scriptService.setArgsIfPresent([
        'arg1',
        'arg2',
        // @ts-ignore
        null,
        // @ts-ignore
        undefined,
      ])

      expect(scriptServiceWithArgs.args).toStrictEqual(['arg1', 'arg2'])
    })

    it('should return itself', () => {
      const scriptService = new ScriptService(mockScriptName)
      const scriptServiceWithArgs = scriptService.setArgsIfPresent([
        'arg1',
        'arg2',
      ])

      expect(scriptService).toEqual(scriptServiceWithArgs)
    })
  })

  describe('execute', () => {
    it('should call spawn', () => {
      new ScriptService(mockScriptName).execute()

      expect(childProcessModule.spawn).toBeCalledTimes(1)
    })

    it('should set childProcess', () => {
      const scriptService = new ScriptService(mockScriptName).execute()

      expect(scriptService.childProcess).toBeInstanceOf(
        childProcessModule.ChildProcess
      )
    })

    it('should call spawn with default arguments', () => {
      new ScriptService(mockScriptName).execute()

      expect(childProcessModule.spawn).toBeCalledWith(
        `${mockDirectoryLocation}/${mockScriptName}`,
        undefined
      )
    })

    it('should call spawn with custom arguments', () => {
      new ScriptService('testScriptName', 'testDirName')
        .setArgsIfPresent(['arg1', 'arg2'])
        .execute()

      expect(childProcessModule.spawn).toBeCalledWith(
        `testDirName/testScriptName`,
        ['arg1', 'arg2']
      )
    })
  })

  // TODO add tests for logConsoleData
  describe('logConsoleData', () => {})
})

describe('scriptServiceBuilder', () => {
  it.each([
    [mockScriptName, mockDirectoryLocation],
    [mockScriptName, undefined],
    [undefined, undefined],
    [undefined, mockDirectoryLocation],
  ])(
    'should return an object of itself',
    (scriptName: string, directoryLocation: string) => {
      const scriptService = scriptServiceBuilder(scriptName, directoryLocation)

      expect(scriptService).toBeInstanceOf(ScriptService)
    }
  )

  it('should set the absolute path to the script with default values from config', () => {
    const scriptService = scriptServiceBuilder(mockScriptName)

    expect(scriptService.pathToScript).toEqual(
      `${mockDirectoryLocation}/${mockScriptName}`
    )
  })

  it('should set the absolute path to the script with custom values', () => {
    const scriptService = scriptServiceBuilder(mockScriptName, 'dir')

    expect(scriptService.pathToScript).toEqual(`dir/${mockScriptName}`)
  })
})
