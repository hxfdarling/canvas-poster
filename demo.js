import Poster from './src/index';
import jpg from './test/test.jpg';

async function render() {
  const img = document.querySelector('#test');
  const poster = new Poster({
    width: 750,
    height: 1224,
  });
  await poster.drawImageBySrc(jpg);
  await poster.drawImageBySrc(jpg, { top: 400, width: '100%' });
  poster.drawTexts(
    [
      {
        text: 'test align right xxxxxxxxxxxxxxxxxddddd',
        fillStyle: 'red',
        size: 40,
      },
    ],

    {
      top: 20,
      left: 30,
      wordWrap: 'breakAll',
      align: 'right',
      width: 700,
    }
  );
  poster.drawTexts('test', { left: 100, top: 100 });
  poster.drawTexts(
    [
      {
        text: 'test align right xxxxxxxxxxxxxxxxxddddd',
        fillStyle: 'red',
        size: 40,
      },
    ],

    {
      left: 20,
      top: 150,
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
    {
      left: 20,
      top: 300,
      align: 'left',
      width: 500,
    }
  );
  poster.drawTexts(
    [
      {
        text: 'test align center  ',
        fillStyle: 'red',
        size: 50,
      },
    ],
    {
      left: 0,
      top: 500,
      align: 'center',
      width: 750,
    }
  );
  img.src = poster.getImageData();
  document.body.appendChild(img);
}
render();
