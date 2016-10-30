/* jshint esnext: true */

export default ((global.performance && global.performance.now) ? global.performance : Date);
