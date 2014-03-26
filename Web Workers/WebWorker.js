// copyFile: true
/* global SimplexNoise: false */
importScripts('perlin-noise.js');
importScripts('seedrandom.min.js');

var numberOfBlocksPerAxis = CHUNK_DIMENTION;
var Noise;

function round(number) {
	"use strict";
	if (number > 0) {
		return 1;
	} else if (number < 0 || number === 0) {
		return 0;
	}
}

// function getRandomInt(min, max) {
// 	"use strict";
// 	return Math.floor(Math.random() * (max - min + 1) + min);
// }

function chunkBlockAlgorithm(x, y, z, lastXBlock, lastYBlock /*,lastZBlock*/ ) {
	"use strict";
	var data = 0;
	var noiseData = 0;
	var plane = 0;
	var depth = 0;
	if (y === 15) {
		data = 1;
	} else if (y <= 5) { // sky level is 0-5
		data = 0;
	} else if (y > 10) { // underground level 14-10
		noiseData = Noise.noise3D(x / 10, y / 20, z / 10);
		data = round(noiseData * 256);
	} else if (y === 10) {
		data = 1;
		// noiseData = (Noise.noise3D(x / 20, y / 20, z / 20) * (256));
		// data = round(noiseData);
	} else if (y === 9) { // ground level 9-6
		plane = 11;
		depth = 2;
		noiseData = (Noise.noise3D(x / plane, y / depth, z / plane) * (256));
		data = round(noiseData);
	} else if (y === 8) { // ground level 9-6
		if (lastYBlock) {
			plane = 15;
			depth = 2;
			noiseData = (Noise.noise3D(x / plane, y / depth, z / plane) * (256));
			data = round(noiseData);
		}
	} else if (y === 7) { // ground level 9-6
		if (lastYBlock) {
			plane = 12;
			depth = 4;
			noiseData = (Noise.noise3D(x / plane, y / depth, z / plane) * (256));
			data = round(noiseData);
		}
	} else if (y === 6) { // ground level 9-6
		if (lastYBlock) {
			plane = 16;
			depth = 6;
			noiseData = (Noise.noise3D(x / plane, y / depth, z / plane) * (256));
			data = round(noiseData);
		}
	}
	return data;
}

function getCoordinate(x, y, z) {
	"use strict";
	if (y === null) {
		return (z * numberOfBlocksPerAxis) + x;
	} else {
		return (y * numberOfBlocksPerAxis + z) * numberOfBlocksPerAxis + x || 0;
	}
}

function fillArray(blockArray, blockDataArray, heightDataArray, XCoord, ZCoord) {
	"use strict";
	Math.seedrandom("seed" + XCoord + ZCoord);
	Noise = new SimplexNoise(Math.random);
	var previousZBlock = 0;
	for (var z = 0; z < numberOfBlocksPerAxis; z++) {
		var previousXBlock = 0;
		for (var x = 0; x < numberOfBlocksPerAxis; x++) {
			var previousYBlock = 0;
			var heightMapSet = false;
			var y = 0;
			var internalCoordinate = 0;
			var heightMapCoordinate = 0;
			var data = 0;
			for (y = numberOfBlocksPerAxis - 1; y > -1; y--) {
				var internalCoordinateX = getCoordinate(x - 1, y, z);
				var internalCoordinateZ = getCoordinate(x, y, z - 1);
				if (internalCoordinateX < 0) {
					internalCoordinateX = 0;
				}
				if (internalCoordinateZ < 0) {
					internalCoordinateZ = 0;
				}
				previousXBlock = blockArray[internalCoordinateX];
				previousZBlock = blockArray[internalCoordinateZ];
				data = chunkBlockAlgorithm(x, y, z, previousXBlock, previousYBlock, previousZBlock);
				internalCoordinate = getCoordinate(x, y, z);
				blockArray[internalCoordinate] = data;
				blockDataArray[internalCoordinate] = 0;
				previousYBlock = data;
			}
			for (y = 0; y < numberOfBlocksPerAxis; y++) {
				internalCoordinate = getCoordinate(x, y, z);
				data = blockArray[internalCoordinate];
				if (heightMapSet === false && data > 0) {
					heightMapSet = true;
					heightMapCoordinate = getCoordinate(x, null, z);
					heightDataArray[heightMapCoordinate] = y;
					y = numberOfBlocksPerAxis;
				}
			}
		}
	}
}

self.addEventListener('message', function(event) {
	"use strict";
	if (event.data[OPERATION] === BUILD_CHUNK) {
		var blockArray = new Uint8Array(event.data[BLOCK_ARRAY]);
		var blockDataArray = new Uint8Array(event.data[DATA_ARRAY]);
		var heightDataArray = new Uint8Array(event.data[HEIGHT_ARRAY]);
		var XCoord = event.data[X_COORDINATE];
		var ZCoord = event.data[Z_COORDINATE];
		var drawX = event.data[DRAW_X];
		var drawZ = event.data[DRAW_Z];
		fillArray(blockArray, blockDataArray, heightDataArray, XCoord, ZCoord);
		self.postMessage([CHUNK_COMPLETE, XCoord, ZCoord, blockArray.buffer, blockDataArray.buffer, heightDataArray.buffer, drawX, drawZ], [blockArray.buffer, blockDataArray.buffer, heightDataArray.buffer]);
	}
}, false);