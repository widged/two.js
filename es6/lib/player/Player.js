/* jshint esnext: true */

import EventEmitter  from '../event-emitter/EventEmitter';
import dom from '../../platform/dom';
import perf from '../../platform/Performance';

/*
  playing two.playing
  A boolean representing whether or not the instance is being updated through the automatic requestAnimationFrame.

frameCount two.frameCount
A number representing how many frames have elapsed.

timeDelta two.timeDelta
A number representing how much time has elapsed since the last frame in milliseconds.
*/

class Player {
  constructor() {
    this.dispatcher = new EventEmitter();
    this.state = {
      ticker: undefined,
      playing: false,
      frameCount: 0,
      timeDelta: undefined
    };
  }


/**
 *  `play` adds the instance to the requestAnimationFrame loop. In affect enabling animation for this instance.
 */
  play() {
    let {ticker} = this.state;
    if(!ticker) {
      ticker = getRequestAnimationFrame(() => { this.whenTick(); });
    }
    setPlaying.call(this, true);
    this.whenPlay();
  }
  /**
  * `pause` removes the instance from the requestAnimationFrame loop. In affect halting animation for this instance.
  */
  pause() {
    this.playing = false;
    this.whenPause();
  }

  /*
  increments the tick for animation, .
  */
  whenTick() {
    var animated = !!this.state.lastFrame;
    var now = perf.now();

    this.frameCount++;

    if (animated) {
      this.timeDelta = parseFloat((now - this.state.lastFrame).toFixed(3));
    }
    this.state.lastFrame = now;
    this.dispatcher.emit('tick', this.frameCount, this.timeDelta);
  }


  whenPlay() {
    this.dispatcher.emit(PlayerEventTypes.playing);
  }
  whenPause() {
    this.dispatcher.emit(PlayerEventTypes.paused);
  }

}


dom.getRequestAnimationFrame = function(onTick) {

  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  var request, cancel;

  for (var i = 0; i < vendors.length; i++) {
    request = global[vendors[i] + 'RequestAnimationFrame'] || request;
    cancel = global[vendors[i] + 'CancelAnimationFrame']
      || global[vendors[i] + 'CancelRequestAnimationFrame'] || cancel;
  }

  request = request || function(callback, element) {
    var currTime = new Date().getTime();
    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
    var id = global.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
    lastTime = currTime + timeToCall;
    return id;
  };
  // cancel = cancel || function(id) {
  //   clearTimeout(id);
  // };

  function recurse() {
    // console.log('loop')
    onTick()
    request(recurse);
  }

  request.init = () => {
    recurse();
  }

  return request;

};

export default Player;
