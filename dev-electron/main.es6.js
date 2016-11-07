/* jshint esnext: true */

// import Two from '../build/two.js';

// var script = document.createElement('script');
// script.type = 'text/javascript';
// script.src = '../build/two.js';
// document.getElementsByTagName('head')[0].appendChild(script);


// script.onload = function() {
// }

import TwoClassic from '../es6/TwoClassic';
import Types from '../es6/renderer/RendererTypes';
import Rectangle from '../es6/import/geom/Rectangle';
import RoundedRectangle from '../es6/import/geom/RoundedRectangle';
import Circle from '../es6/import/geom/Circle';
import Ellipse from '../es6/import/geom/Ellipse';
import Line from '../es6/import/geom/Line';
import Polygon from '../es6/import/geom/Polygon';
import Star  from '../es6/import/geom/Star';
import ArcSegment from '../es6/import/geom/ArcSegment';
import SineRing from '../es6/import/geom/SineRing';
import RadialGradient from '../es6/renderable/path-gradient/RadialGradient';
import LinearGradient from '../es6/renderable/path-gradient/LinearGradient';

function main() {


var appNode = document.getElementById('app');

appNode.appendChild(h('canvas'))
  var two = new TwoClassic({
    width: 600,
    height: 400,
    type: Types.canvas
  }).appendTo(appNode);
  renderShapes(two);

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


}
main();

function h(str) {
  var h = document.createElement('h3');
  h.innerHTML = str;
  return h;
}

function renderShapes(two) {
  var gp = two.makeGroup();

  var rect = two.makeGeometry(Rectangle(115, 90, 150, 100));
  rect.setProps({fill: "orange", opacity: 0.25, stroke: 'transparent'});
  gp.add(rect);

  var ell = two.makeGeometry(Ellipse(40, 60, 30,20, 20));
  ell.setProps({fill: "blue", opacity: 0.25, stroke: 'transparent'});

  var arc = two.makeGeometry(ArcSegment(115, 90, 150, 100, 103, 40, 55));
  arc.setProps({fill: "red", stroke: "green", opacity: 0.25});

  var sine = two.makeGeometry(SineRing(115, 90, 150, 100, 103, 40, 5));
  sine.setProps({fill: "red", opacity: 0.25});
  
  var rrect = two.makeGeometry(RoundedRectangle(390, 300, 150, 100, 9));
  rrect.setProps({fill: "pink", opacity: 0.25, stroke: 'transparent'});

  var line = two.makeGeometry(Line(10,20,300,300));
  line.setProps({fill: "green", stroke: "green", opacity: 0.25});

  var poly = two.makeGeometry(Polygon(10,20,300,3));
  poly.setProps({fill: "brown", stroke: "green", opacity: 0.25});

  var star = two.makeGeometry(Star(60,60,30,20, 10));
  star.setProps({fill: "purple", stroke: "purple", opacity: 0.25});


  // ----------- gradients ------
  //

var radius = Math.max(150, 100);
  var radialGradient = two.makeRadialGradient(
    0, 0,
    radius,
    {offset: 0, color: 'rgba(255, 0, 0, 1)', opacity: 1},
    {offset: 0.5, color: 'rgba(255, 0, 0, 0)', opacity: 0},
  );
  var vignette = two.makeGeometry(RoundedRectangle(390, 70, 150, 100, 10))
  vignette.setProps({fill: radialGradient});


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
    {offset: 0, color: colors[0]},
    {offset: 1, color: colors[1]},
    {offset: 1, color: colors[2]}
  );

  var rectangle = two.makeGeometry(Rectangle(390, 185, 150, 100));
  rectangle.setProps({fill: linearGradient, stroke: 'transparent'});

  var txt = two.makeText('hello there', 200,200);
  txt.setProps({opacity: 0.75});

  two.update();

}