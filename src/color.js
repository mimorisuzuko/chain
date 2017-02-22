const Color = require('color');
const white = Color('rgb(212, 212, 212)');
const black = Color('rgb(30, 30, 30)');
const lblack = black.lighten(0.3);
const llblack = black.lighten(0.6);
const red = Color('rgb(229, 57, 53)');
const blue = Color('rgb(33, 150, 243)');
const vblue = Color('rgb(86, 156, 214)');
const vlblue = Color('rgb(156, 220, 254)');
const vpink = Color('rgb(197, 134, 192)');

module.exports = {
	black,
	white,
	lblack,
	llblack,
	red,
	blue,
	vblue,
	vlblue,
	vpink
};
