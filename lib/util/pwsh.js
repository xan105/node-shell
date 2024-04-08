import { shouldString, shouldObj } from "@xan105/is/assert";
import { asBoolean } from "@xan105/is/opt";

function parse(str){
  const separator = ":";
  const pos = str.indexOf(separator);
  const key = str.substring(0, pos).trim();
  const value = str.substring(pos + separator.length, str.length).trim().replace(/\s{2,}/g, " ");
  return { key, value };
}

function parseList(stdout, option = {}){
  shouldString(stdout);
  shouldObj(option);

  const options = {
    translate: asBoolean(option.translate) ?? true
  };

  const entries = stdout.split("\r\n\r\n")
                  .filter(entry => entry != "");
  const result = entries.map((entry) => { 
    const data = Object.create(Object.prototype);
    const lines = entry.trim().split("\r\n");
    for (const line of lines)
    {
      const { key, value } = parse(line);
      
      if(options.translate){
        if(value.toLowerCase() === "false") data[key] = false;
        else if (value.toLowerCase() === "true") data[key] = true;
        else if (value === "") data[key] = null;
        else if (!isNaN(value)){
          const number = Number(value);
          data[key] = Number.isInteger(number) && !Number.isSafeInteger(number) ? BigInt(value) : number;
        } 
        else data[key] = value;
      }
      else data[key] = value;
    }
    return data;
  });
  
  return result;
}

export { parseList };