# canvas-poster

Draw text and pictures to canvas, and export picture data, text support color, size, newline (pre, nowrap, breakAll, breakWord), line height, bold, underline, etc.

## Useage

install from npm

```shell
yarn add canvas-poster
```

or

```shell
npm i canvas-poster
```

example

```js
import Poster from 'canvas-poster'

async function render(){
  let poster new Poster({width:200,height:200,scale:2});
  await poster.drawImage('./test.png',{w:"100%",x:0,y:0})
  poster.drawTexts([
    {text:'test render texts',size:20},{text:'test',size:30,fillStyle:'red'}
    ],
    10,
    10,
    {wordWrap:"breakAll",with:200}
  );
  let img = document.createElement('img');
  img.src = poster.getImageData();
}
render();
```

use dom

```js

import {renderDom} from 'canvas-poster'
renderDom(dom).then((poster)=>{
   let img = document.createElement('img');
  img.src = poster.getImageData();
})

```
