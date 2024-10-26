const config = require('./config')
const { spawn } = require('child_process')

class ScriptService {
  constructor(
    scriptName,
    directoryLocation
  ) {
    this.scriptName = scriptName
    this.directoryLocation = directoryLocation || config.scripts.location
    this.setAbsolutePathToScript(directoryLocation, scriptName)
    return this
  }

  setAbsolutePathToScript(
    directoryLocation,
    scriptName
  ) {
    this.pathToScript = `${directoryLocation}/${scriptName}`
    return this
  }

  setArgsIfPresent(args) {
    this.args = args.filter((arg) => arg !== undefined && arg !== null)
    return this
  }

  execute() {
    this.childProcess = spawn(this.pathToScript, this.args, { stdio: 'inherit' })
    process.on('SIGINT', () => {
      console.log('Caught Ctrl-C. Sending SIGINT to child process...');
      // Send `SIGINT` to the child process
      this.childProcess.kill('SIGINT');
    });
    return this
  }

  logConsoleData(logger = console) {
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

const scriptServiceBuilder = (
  scriptName,
  directoryLocation = config.scripts.location
) => {
  return new ScriptService(scriptName, directoryLocation)
}

module.exports = {
  scriptServiceBuilder
}
