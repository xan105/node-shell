declare interface Option{
  translate?: boolean
}

export function parseList(stdout: string, option?: Option): object[];
