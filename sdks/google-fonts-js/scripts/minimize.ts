import fulljson from "../google-fonts-latest.json";
import * as fs from "fs";

function main() {
  const minimized = fulljson.items.map(minimize_item);
  const jsonstr = JSON.stringify(minimized);
  fs.writeFile(
    __dirname + "../out/google-fonts-latest.min.json",
    jsonstr,
    function (err) {
      if (err) {
        return console.log(err);
      }
      console.log("The file was saved!");
    }
  );
  // TODO: write file.
}

/**
 * Example - 
 * ```json
{
            "family": "ABeeZee",
            "variants": [
                "regular",
                "italic"
            ],
            "subsets": [
                "latin"
            ],
            "version": "v14",
            "lastModified": "2020-09-02",
            "files": {
                "regular": "http://fonts.gstatic.com/s/abeezee/v14/esDR31xSG-6AGleN6tKukbcHCpE.ttf",
                "italic": "http://fonts.gstatic.com/s/abeezee/v14/esDT31xSG-6AGleN2tCklZUCGpG-GQ.ttf"
            },
            "category": "sans-serif",
            "kind": "webfonts#webfont"
        }
```
 */
interface FontItem {
  family: string;
  variants: string[];
  subsets: string[];
}

function minimize_item(item: FontItem) {
  return <FontItem>{
    family: item.family,
    variants: item.variants,
    subsets: item.subsets,
  };
}

if (require.main === module) {
  main();
}
