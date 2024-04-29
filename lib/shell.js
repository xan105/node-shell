/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the root directory of this source tree.
*/

import { cwd, env } from "node:process";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { shouldObj, shouldStringNotEmpty } from "@xan105/is/assert";
import { asBoolean, asStringNotEmpty } from "@xan105/is/opt";
import { isObj, isArrayOfString } from "@xan105/is";
import { attempt, Failure } from "@xan105/error";
import { resolve } from "@xan105/fs/path";

import { shells, defaultShell } from "./shells.js";

async function run(cmd, option = {}){

  if (isArrayOfString(cmd)) cmd = cmd.join(" ");
  shouldStringNotEmpty(cmd);
  
  shouldObj(option);
  const options = {
    shell: Object.keys(shells).includes(option.shell) ? option.shell : defaultShell,
    script: asBoolean(option.script) ?? false,
    cwd: asStringNotEmpty(option.cwd) ?? cwd(),
    env: isObj(option.env) ? { ...env, ...option.env } : env,
    silent: asBoolean(option.silent) ?? false,
    escape: asBoolean(option.escape) ?? true
  };
  
  const shell = shells[options.shell];

  if(options.escape && shell.escape !== "\\") cmd = cmd.replaceAll(shell.escape, shell.escape + shell.escape);

  if(options.script) cmd = resolve(cmd);
  else {
    const { pre = "", post = "" } = shell;
    cmd = pre + cmd + post;
  }

  switch(options.shell){
    case "powershell":
    case "pwsh": {
      const quote = '"';
      cmd = cmd.replaceAll(quote, "\\" + quote);
      break;
    }
  }

  const [ process, err ] = await attempt(promisify(execFile), [
    options.shell,
    [
      ...shell[options.script ? "file" : "command"] ?? [],
      cmd
    ],
    {
      cwd: options.cwd,
      env: options.env,
      encoding: "utf8",
      maxBuffer: 200 * (1024 * 1024), //200 MiB
      shell: false,
      windowsHide: true,
      windowsVerbatimArguments: true //No quote handling behind the scene on Windows
    }
  ]);

  if (!options.silent){
    if(err || process.stderr) {
      throw new Failure(err?.message ?? process.stderr, { 
        code: asStringNotEmpty(err?.code) ?? "ERR_SHELL", 
        info: { 
          exitCode: err?.code ?? 1,
          shell: options.shell
        }
      });
    }
  }

  return process.stdout;
}

export { run };