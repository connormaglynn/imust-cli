import config from '../config'
import { ChildProcess, spawn } from 'child_process'

export class ScriptService {
  public pathToScript: string
  public childProcess: ChildProcess
  public args: string[]

  constructor(
    public scriptName: string,
    public directoryLocation: string = config.scripts.location
  ) {
    this.setAbsolutePathToScript(directoryLocation, scriptName)
    return this
  }

  public setAbsolutePathToScript(
    directoryLocation: string,
    scriptName: string
  ): this {
    this.pathToScript = `${directoryLocation}/${scriptName}`
    return this
  }

  public setArgsIfPresent(args: string[]): this {
    this.args = args.filter((arg) => arg !== undefined && arg !== null)
    return this
  }

  public execute(): this {
    this.childProcess = spawn(this.pathToScript, this.args)
    return this
  }

  public logConsoleData(logger: Console = console) {
    // FIXME: workaround since optional chaining not working
    if (this.childProcess.stderr && this.childProcess.stdout) {
      this.childProcess.stderr.on('data', (data) => {
        logger.error(data.toString())
      })

      this.childProcess.stdout.on('data', (data) =>
        console.log(data.toString())
      )
    }
    return this
  }
}

export const scriptServiceBuilder = (
  scriptName: string,
  directoryLocation: string = config.scripts.location
): ScriptService => {
  return new ScriptService(scriptName, directoryLocation)
}
