/* jshint esnext: true */

// import Two from '../build/two.js';

// var script = document.createElement('script');
// script.type = 'text/javascript';
// script.src = '../build/two.js';    
// document.getElementsByTagName('head')[0].appendChild(script);


// script.onload = function() {
// }

function main() {

	var Two = require('../es6/Two');
	var Types = require('../es6/constants/RendererTypes').default;

	var two = new Two({
	          width: 800,
	          height: 800,
	          type: Types.canvas
	        }).appendTo(document.getElementById('app'));


var gp = two.makeGroup();

var Rectangle = require('../es6/geometry/Rectangle').default;
var rect = two.addShape(Rectangle(115, 90, 150, 100));
rect.fill = "orange";
rect.opacity = 0.25;
rect.noStroke();
gp.add(rect);

var Circle = require('../es6/geometry/Circle').default;
var Ellipse = require('../es6/geometry/Ellipse').default;
var ell = two.addShape(Ellipse(40, 60, 30,20, 20));
ell.fill = "blue";
ell.opacity = 0.25;
ell.noStroke();

var ArcSegment = require('../es6/geometry/ArcSegment').default;
var arc = two.addShape(ArcSegment(115, 90, 150, 100, 103, 40, 55));
arc.fill = "red";
arc.stroke = "green";
arc.opacity = 0.25;

var SineRing = require('../es6/geometry/SineRing').default;
var sine = two.addShape(SineRing(115, 90, 150, 100, 103, 40, 5));
sine.fill = "red";
sine.opacity = 0.25;

var RoundedRectangle = require('../es6/geometry/RoundedRectangle').default;
var rrect = two.addShape(RoundedRectangle(315, 390, 150, 100, 9));
rrect.fill = "pink";
rrect.opacity = 0.25;
rrect.noStroke();
 
var Line = require('../es6/geometry/Line').default;
var line = two.addShape(Line(10,20,300,300));
line.fill = "green";
line.stroke = "green";
line.opacity = 0.25;

var Polygon = require('../es6/geometry/Polygon').default;
var poly = two.addShape(Polygon(10,20,300,3));
poly.fill = "brown";
poly.stroke = "green";
poly.opacity = 0.25;

var Star = Two.Star = require('../es6/geometry/Star').default;
var star = two.addShape(Star(60,60,30,20, 10));
star.fill = "purple";
star.stroke = "purple";
star.opacity = 0.25;

Two.Text = require('../es6/shape/Text').default;
var txt = two.makeText('hello there', 200,200);
txt.opacity = 0.25;

// ----------- gradients ------
// 
Two.Stop = require('../es6/shape/Stop').default;
Two.Gradient = require('../es6/shape/Gradient').default;

Two.RadialGradient = require('../es6/shape/RadialGradient').default;
var radius = Math.max(150, 100);
var radialGradient = two.makeRadialGradient(
	0, 0,
	radius,
	new Two.Stop(0,  'rgba(255, 0, 0, 1)', 1),
	new Two.Stop(0.5, 'rgba(255, 0, 0, 0)', 0)
);

var vignette = two.addShape(RoundedRectangle(215, 290, 150, 100, 10))
vignette.fill = radialGradient;


Two.LinearGradient = require('../es6/shape/LinearGradient').default;
// Two.js colors from main.css
var colors = [
  'rgb(255, 64, 64)',
  'rgb(255, 128, 0)',
  'rgb(0, 200, 255)',
  'rgb(0, 191, 168)',
  'rgb(153, 102, 255)',
  'rgb(255, 244, 95)'
];
colors.index = 0;


var linearGradient = two.makeLinearGradient(
  150 / 2, - 100 / 2,
  150 / 2, 100 / 2,
  new Two.Stop(0, colors[0]),
  new Two.Stop(1, colors[1]),
  new Two.Stop(1, colors[2])
);

var rectangle = two.addShape(Rectangle(315, 390, 150, 100));
rectangle.noStroke();

rectangle.fill = linearGradient;

two.update();

}
main();

