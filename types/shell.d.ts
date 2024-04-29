declare interface Option{
  shell?: boolean,
  script?: boolean,
  cwd?: string,
  env?: object,
  silent?: boolean,
  escape?: boolean
}

export function run(cmd: string, option?: Option): Promise<string>;
