About
=====

Run external command or script.

📦 Scoped `@xan105` packages are for my own personal use but feel free to use them.

Example
=======

Run external command and display the output

```js
import { $ } from "@xan105/shell";
const stdout = await $("echo Hello World");
console.log(stdout);
```

Run pwsh cmdlet and parse the output

```js
import { $, pwsh } from "@xan105/shell";
const stdout = await $("Get-StartApps | Format-List");
const json = pwsh.parseList(stdout)
console.log(json);
```

Run external script

```js
import { $ } from "@xan105/shell";
await $("/path/to/script", { script: true });
```

Install
=======

```
npm install @xan105/shell
```

API
===

⚠️ This module is only available as an ECMAScript module (ESM).

## Named export

### `$(cmd: string, option?: object): Promise<string>`

Run external command or script.

**⚙️ Options**

 - `shell?: string` (powershell/sh)
 
    Shell to send the command/script to.
  
 - `script?: boolean` (false)
 
    `cmd` is considered as the script's filePath when set to `true`.
 
 - `cwd?: string` (current cwd)
 
    Current working dir.
    
 - `env?: { key: value, ... }` (system env)
 
    Env. variable.
 
 - `silent?: boolean` (false)
 
    Silent fail on error (no throw) when set to `true`
    
 - `escape?: boolean` (true)

    When set to `true`, If the specified shell has an *escape char* different than `\`, escape it.

**Return**

✔️ Shell output *(stdout)*
❌ Rejects on error

## pwsh

### `parseList(stdout: string, option?: object): object[]`

Parse a PowerShell cmdlet list formated output into a JSON like object.

eg: `foo | Format-List` or `foo | fl`

⚙️ **Options**

  - `translate?: boolean` (true)
  
    Auto string convertion to boolean, number, etc.
    
Example:

```js
import { $ } from "@xan105/shell";
import { parseList } from "@xan105/shell/pwsh"

const stdout = await $("ls | Format-List");
const json = parseList(stdout)
console.log(json);
```

⚠️ **JSON compatibility**

Some integers will be represented as **BigInt** due to their size when using the translate option.<br/>
**BigInt is not a valid value in the JSON spec.**<br/>
As such when stringify-ing the returned object to JSON you'll need to handle the JSON stringify replacer function to prevent it to fail.

A common workaround is to represent them as a string:

```js
JSON.stringify(data, function(key, value) {
  if(typeof value === "bigint")
    return value.toString();
  else
    return value;
});
```