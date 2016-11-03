/* jshint esnext: true */

// import Two from '../build/two.js';

// var script = document.createElement('script');
// script.type = 'text/javascript';
// script.src = '../build/two.js';
// document.getElementsByTagName('head')[0].appendChild(script);


// script.onload = function() {
// }

function main() {

var TwoClassic = require('../es6/TwoClassic').default;
var Types = require('../es6/constant/RendererTypes').default;

var appNode = document.getElementById('app');

appNode.appendChild(h('svg'))

  var two = new TwoClassic({
    width: 600,
    height: 400,
    type: Types.svg
  }).appendTo(appNode);
  renderShapes(two);

appNode.appendChild(h('webgl'))
  var two = new TwoClassic({
    width: 600,
    height: 400,
    type: Types.webgl
  }).appendTo(appNode);
  renderShapes(two);

appNode.appendChild(h('canvas'))

  var two = new TwoClassic({
    width: 600,
    height: 400,
    type: Types.canvas
  }).appendTo(appNode);
  renderShapes(two);



}
main();

function h(str) {
  var h = document.createElement('h3');
  h.innerHTML = str;
  return h;
}

function renderShapes(two) {
  var gp = two.makeGroup();

  var Rectangle = require('../es6/geometry/Rectangle').default;
  var rect = two.makeGeometry(Rectangle(115, 90, 150, 100));
  rect.fill = "orange";
  rect.opacity = 0.25;
  rect.noStroke();
  gp.add(rect);

  var Circle = require('../es6/geometry/Circle').default;
  var Ellipse = require('../es6/geometry/Ellipse').default;
  var ell = two.makeGeometry(Ellipse(40, 60, 30,20, 20));
  ell.fill = "blue";
  ell.opacity = 0.25;
  ell.noStroke();

  var ArcSegment = require('../es6/geometry/ArcSegment').default;
  var arc = two.makeGeometry(ArcSegment(115, 90, 150, 100, 103, 40, 55));
  arc.fill = "red";
  arc.stroke = "green";
  arc.opacity = 0.25;

  var SineRing = require('../es6/geometry/SineRing').default;
  var sine = two.makeGeometry(SineRing(115, 90, 150, 100, 103, 40, 5));
  sine.fill = "red";
  sine.opacity = 0.25;

  var RoundedRectangle = require('../es6/geometry/RoundedRectangle').default;
  var rrect = two.makeGeometry(RoundedRectangle(390, 300, 150, 100, 9));
  rrect.fill = "pink";
  rrect.opacity = 0.25;
  rrect.noStroke();

  var Line = require('../es6/geometry/Line').default;
  var line = two.makeGeometry(Line(10,20,300,300));
  line.fill = "green";
  line.stroke = "green";
  line.opacity = 0.25;

  var Polygon = require('../es6/geometry/Polygon').default;
  var poly = two.makeGeometry(Polygon(10,20,300,3));
  poly.fill = "brown";
  poly.stroke = "green";
  poly.opacity = 0.25;

  var Star = require('../es6/geometry/Star').default;
  var star = two.makeGeometry(Star(60,60,30,20, 10));
  star.fill = "purple";
  star.stroke = "purple";
  star.opacity = 0.25;

  var txt = two.makeText('hello there', 200,200);
  txt.opacity = 0.75;

  // ----------- gradients ------
  //
  var RadialGradient = require('../es6/shape/gradient/RadialGradient').default;
  var radius = Math.max(150, 100);
  var radialGradient = two.makeRadialGradient(
    0, 0,
    radius,
    new RadialGradient.Stop(0,  'rgba(255, 0, 0, 1)', 1),
    new RadialGradient.Stop(0.5, 'rgba(255, 0, 0, 0)', 0)
  );
  var stop = new RadialGradient.Stop(0,  'rgba(255, 0, 0, 1)', 1);

  var vignette = two.makeGeometry(RoundedRectangle(390, 70, 150, 100, 10))
  vignette.fill = radialGradient;


  var LinearGradient = require('../es6/shape/gradient/LinearGradient').default;
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
    new LinearGradient.Stop(0, colors[0]),
    new LinearGradient.Stop(1, colors[1]),
    new LinearGradient.Stop(1, colors[2])
  );

  var rectangle = two.makeGeometry(Rectangle(390, 185, 150, 100));
  rectangle.noStroke();

  rectangle.fill = linearGradient;

  two.update();

}