// http://stackoverflow.com/questions/839899/how-do-i-calculate-a-point-on-a-circles-circumference
// radians = degrees * (pi/180)
// https://github.com/bjornharrtell/jsts/blob/master/examples/buffer.html

var featurecollection = require('turf-featurecollection');
var polygon = require('turf-polygon');
var combine = require('turf-combine');
var jsts = require('jsts');

/**
* Calculates a buffer for a {@link Point}, {@link LineString}, or {@link Polygon} {@link Feature}/{@link FeatureCollection} for a given radius. Units supported are miles, kilometers, and degrees.
*
* @module turf/buffer
* @param {FeatureCollection} feature - a Feature or FeatureCollection of any type
* @param {Number} distance - distance to draw the buffer
* @param {String} unit - 'miles' or 'kilometers'
* @return {FeatureCollection} a FeatureCollection containing {@link Polygon} features representing buffers
*
* @example
* var pt = turf.point(14.616599, -90.548630)
* var unit = 'miles'
*
* var buffered = turf.buffer(pt, 10, unit)
*
* //=buffered
*/

module.exports = function(feature, radius, units, done){
  var buffered;

  done = done || function () {};

  switch(units){
    case 'miles':
      radius = radius / 69.047;
      break
    case 'feet':
      radius = radius / 364568.0;
      break
    case 'kilometers':
      radius = radius / 111.12;
      break
    case 'meters':
      radius = radius / 111120.0;
      break
    case 'degrees':
      break
  }

  if(feature.type === 'FeatureCollection'){
    var multi = combine(feature);
    multi.properties = {};

    buffered = bufferOp(multi, radius);

    done(null, buffered);
    return buffered;
  }
  else{
    buffered = bufferOp(feature, radius);
    
    done(null, buffered);
    return buffered;
  }
}

var bufferOp = function(feature, radius){
  var reader = new jsts.io.GeoJSONReader();
  var geom = reader.read(JSON.stringify(feature.geometry));
  var buffered = geom.buffer(radius);
  var parser = new jsts.io.GeoJSONParser();
  buffered = parser.write(buffered);

  if(buffered.type === 'MultiPolygon'){
    buffered = {
      type: 'Feature',
      geometry: buffered,
      properties: {}
    };
    buffered = featurecollection([buffered]);
  }
  else{
    buffered = featurecollection([polygon(buffered.coordinates)]);
  }

  return buffered;
}
