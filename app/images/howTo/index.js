import onePNG from './PNG/one.png';
import oneGIF from './GIF/one.gif';
import twoPNG from './PNG/two.png';
import twoGIF from './GIF/two.gif';

export default {
  PNG: {
    1: onePNG,
    2: twoPNG,
  },
  GIF: {
    1: oneGIF,
    2: twoGIF,
  },
  TEXT: {
    1: {
      title: 'Put On/Take Off',
      body: 'How to put on/take off your Backbone',
    },
    2: {
      title: 'Adjust',
      body: 'How to adjust your Backbone',
    },
  },
  PLAY: 'play',
  PAUSE: 'pause',
};
