import { platform } from "node:process";

const SHELLS = {
  win32: {
    cmd: {
      command: ["/d", "/c"],
      file: ["/d", "/c", "call"]
    },
    powershell: {
      command: ["-NoProfile", "-NoLogo", "-Command"],
      file: ["-NoProfile", "-NoLogo", "-ExecutionPolicy", "Bypass", "-File"]
    },
    pwsh: {
      command: ["-NoProfile", "-NoLogo", "-Command"],
      file: ["-NoProfile", "-NoLogo", "-ExecutionPolicy", "Bypass", "-File"]
    }
  },
  linux: {
    sh: {
      command: ["--noprofile", "--norc", "-c"],
      file: ["--noprofile", "--norc"]
    },
    bash:{
      command: ["--noprofile", "--norc", "-c"],
      file: ["--noprofile", "--norc"]
    },
    fish:{
      command: ["-c"],
      file: []
    },
    pwsh: {
      command: ["-NoProfile", "-NoLogo", "-Command"],
      file: ["-NoProfile", "-NoLogo", "-ExecutionPolicy", "Bypass", "-File"]
    }
  }
};

export const defaultShell = platform === "win32" ? "powershell" : "sh";
export const shells = SHELLS[platform] ?? SHELLS["linux"];