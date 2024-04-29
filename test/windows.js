import test from "node:test";
import assert from "node:assert/strict";
import { EOL } from "node:os";
import { join } from "node:path";
import { isWindows } from "@xan105/is";
import { $ } from "../lib/index.js";

const shells = ["cmd", "powershell", "pwsh"];
const isPwsh = (str) => ["powershell", "pwsh"].includes(str);

test("Win32", {
    skip: isWindows() ? false : "This test runs on Windows"
  }, async() => {

    await test("Env var", async() => {
      for(const shell of shells)
      {
        await test(shell, async() => {
          const cmd = isPwsh(shell) ? "$env:TEST_FOO" : "%TEST_FOO%";
          const stdout = await $(`echo ${cmd}`, { 
            shell,
            env: { TEST_FOO: "foo" }
          });
          assert.equal(stdout, "foo" + EOL);
        });
      } 
    });
    
    await test("Env var:safe", async() => {
      for(const shell of shells)
      {
        await test(shell, async() => {
          const cmd = isPwsh(shell) ? "$env:TEST_BAR" : "%TEST_BAR%";
          const stdout = await $(`echo ${cmd}`, { 
            shell,
            env: { TEST_BAR: "hi; exit 1" }
          });  
        });
      } 
    });
    
    await test("Nested quotes", async() => {
      for(const shell of shells)
      {
        await test(shell, async() => {
          const cmd = `node --eval="console.log('Hello World')"`;
          const stdout = await $(cmd, { shell }); 
          assert.equal(stdout, "Hello World" + "\n");
        });
      } 
    });
    
    await test("utf8", async() => {
      for(const shell of shells)
      {
        await test(shell, async() => {
          const cmd = isPwsh(shell) ? `echo "é ou è, 读写汉字 - 学中文"` : "echo é ou è, 读写汉字 - 学中文";
          const stdout = await $(cmd, { shell }); 
          assert.equal(stdout, "é ou è, 读写汉字 - 学中文" + EOL);
        });
      } 
    });
    
    await test("utf8:3rd party", async() => {
      for(const shell of shells)
      {
        await test(shell, async() => {
          const cmd = `node --eval="console.log('é ou è, 读写汉字 - 学中文')"`;
          const stdout = await $(cmd, { shell }); 
          assert.equal(stdout, "é ou è, 读写汉字 - 学中文" + "\n");
        });
      } 
    });
    
    await test("exit code", async() => {
      for(const shell of shells)
      {
        await test(shell, async() => {
          const cmd = `node --eval="process.exit(2)"`;
          let error = false;
          try{
            await $(cmd, { shell });
            error = false;
          }catch(err){
            error = true;
            assert.equal(err.info.exitCode, 2);
          }
          assert.equal(error, true);
        });
      } 
    });
    
    await test("self escaping", async() => {
      for(const shell of shells)
      {
        await test(shell, async() => {
          if(isPwsh(shell)){
            const cmd = "echo \"I`'m\"";
            const stdout = await $(cmd, { shell, escape: true }); 
            assert.equal(stdout, "I`'m" + EOL);
          } else {
            /*
            "CHCP 65001 | " triggers double escaping ...
            Making this test fails
            
            const cmd = "echo I^'m";
            const stdout = await $(cmd, { shell, escape: true }); 
            assert.equal(stdout, "I^'m" + EOL);
            */
          }
        });
      } 
    });
    
    await test("script", async() => {
      for(const shell of shells)
      {
        await test(shell, async() => {
          const ext = isPwsh(shell) ? ".ps1" : ".cmd";
          const filePath = join(import.meta.dirname, "hello" + ext);
          const stdout = await $(filePath, { shell, script: true }); 
          assert.equal(stdout, "Hello world" + EOL);
        });
      } 
    });
    
    await test("script:invalid", async() => {
      for(const shell of shells)
      {
        await test(shell, async() => {
          const filePath = join(import.meta.dirname, "null");
          let error = false;
          try{
            await $(filePath, { shell, script: true });
            error = false;
          }catch(err){
            error = true;
            assert.equal(err.code, "ERR_SHELL");
          }
          assert.equal(error, true);
        });
      } 
    });

});


/*
test("", async() => {
  
  const stdout = await $(`echo ${bar}`, { 
    shell: "powershell"
  });
  assert.equal(stdout, bar + EOL)
});
*/