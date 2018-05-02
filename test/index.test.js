import { testx } from '../src';

describe('canvas-poster', () => {
  test('test', async () => {
    expect(testx()).toMatchSnapshot();
  });
  test('main', async () => {
    // const poster = new Poster();
    // poster.drawTexts([
    //   {
    //     text: 'test poster ',
    //     size: 30,
    //     fillStyle: '#510f0f',
    //   },
    // ]);
  });
});
