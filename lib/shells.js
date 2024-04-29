/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the root directory of this source tree.
*/

import { platform } from "node:process";

const SHELLS = {
  win32: {
    cmd: {
      command: ["/d", "/c"],
      file: ["/d", "/c", "call"],
      pre: "CHCP 65001 | ",
      escape: "^"
    },
    powershell: {
      command: ["-NoProfile", "-NoLogo", "-NonInteractive", "-Command"],
      file: ["-NoProfile", "-NoLogo", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File"],
      escape: "`",
      pre: "$OutputEncoding = [console]::InputEncoding = [console]::OutputEncoding = New-Object System.Text.UTF8Encoding; ",
      post: "; exit $LASTEXITCODE"
    },
    pwsh: {
      command: ["-NoProfile", "-NoLogo", "-NonInteractive", "-Command"],
      file: ["-NoProfile", "-NoLogo", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File"],
      escape: "`",
      pre: "$OutputEncoding = [console]::InputEncoding = [console]::OutputEncoding = New-Object System.Text.UTF8Encoding; ",
      post: "; exit $LASTEXITCODE"
    }
  },
  linux: {
    sh: {
      command: ["--noprofile", "--norc", "-c"],
      file: ["--noprofile", "--norc"]
    },
    bash:{
      command: ["--noprofile", "--norc", "-c"],
      file: ["--noprofile", "--norc"],
      pre: "set -euo pipefail;"
    },
    fish:{
      command: ["-c"],
      file: []
    },
    pwsh: {
      command: ["-NoProfile", "-NoLogo", "-NonInteractive", "-Command"],
      file: ["-NoProfile", "-NoLogo", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File"],
      escape: "`",
      post: "; exit $LASTEXITCODE"
    }
  }
};

export const defaultShell = platform === "win32" ? "powershell" : "sh";
export const shells = SHELLS[platform] ?? SHELLS["linux"];