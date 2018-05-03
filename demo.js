import Poster from './src/index';
import jpg from './test/test.jpg';

async function render() {
  const img = document.querySelector('#test');
  const poster = new Poster({
    width: 750,
    height: 1224,
  });
  await poster.drawImage(jpg);
  await poster.drawImage(jpg, { y: 400, w: '100%' });
  poster.drawTexts(
    [
      {
        text: 'test align right xxxxxxxxxxxxxxxxxddddd',
        fillStyle: 'red',
        size: 40,
      },
    ],
    20,
    30,
    {
      wordWrap: 'breakAll',
      align: 'right',
      width: 700,
    }
  );
  poster.drawTexts('test', 100, 100);
  poster.drawTexts(
    [
      {
        text: 'test align right xxxxxxxxxxxxxxxxxddddd',
        fillStyle: 'red',
        size: 40,
      },
    ],
    20,
    150,
    {
      wordWrap: 'nowrap',
      align: 'right',
      width: 700,
    }
  );
  poster.drawTexts(
    [
      {
        text: 'test align left ',
        fillStyle: 'red',
        size: 50,
      },
      {
        text: '文本居左文本居左',
        fillStyle: 'green',
        size: 50,
      },
    ],
    20,
    300,
    {
      align: 'left',
      width: 500,
    }
  );
  img.src = poster.getImageData();
  document.body.appendChild(img);
}
render();
