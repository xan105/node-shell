import { cwd, env } from "node:process";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { shouldObj, shouldStringNotEmpty } from "@xan105/is/assert";
import { asBoolean, asStringNotEmpty } from "@xan105/is/opt";
import { isObj, isArrayOfString } from "@xan105/is";
import { attempt, Failure } from "@xan105/error";

import { shells, defaultShell } from "./util/shells.js";

async function run(cmd, option = {}){

  if (isArrayOfString(cmd)) cmd = cmd.join(" ");
  shouldStringNotEmpty(cmd);
  
  shouldObj(option);
  const options = {
    shell: Object.keys(shells).includes(option.shell) ? option.shell : defaultShell,
    script: asBoolean(option.script) ?? false,
    cwd: asStringNotEmpty(option.cwd) ?? cwd(),
    env: isObj(option.env) ? { ...env, ...option.env } : env,
    silent: asBoolean(option.silent) ?? false
  };

  const args = [
    ...shells[options.shell]?.[options.script ? "file" : "command"] ?? []
  ];

  if(options.shell !== "cmd") cmd = cmd.replaceAll("\"", "\\\"");
  args.push(`"${cmd}"`);

  const [ process, err ] = await attempt(promisify(execFile), [
    options.shell,
    args,
    {
      cwd: options.cwd,
      env: options.env,
      encoding: "utf8",
      shell: false,
      windowsHide: true,
      windowsVerbatimArguments: true //No quote handling behind the scene on Windows
    }
  ]);

  if (!options.silent){
    if(err) {
      const code = asStringNotEmpty(err.code) ?? "ERR_SHELL";
      throw new Failure(err.message, code);
    }
    else if(process.stderr){
      throw new Failure(process.stderr, "ERR_SHELL");
    }
  }

  return process.stdout;
}

export { run };