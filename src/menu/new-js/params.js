class Params {
  constructor(files,dir,script){
    this.files = files;
    this.dir = dir;
    this.script = script;
    this.proton = {
      scriptsDir: myConfig.scriptsPath || path.join(__dirname,'scripts'),
      selectedScriptDir: path.join(scriptsDir,selectedScript),
      scriptFileName: path.join(scriptsDir,selectedScript,myScripts[selectedScript].script),
      scriptJson: path.join(scriptsDir,selectedScript,myConfig.interfaceFile) || path.join(scriptsDir,selectedScript,`interface.json`),
      libsPath: myConfig.libsPath || path.join(__dirname,'libs'),
      pythonExe: path.join(libsPath,'python/python.exe'),
      parallelDirs: myConfig.parallelDirs || false
    }
  }
}