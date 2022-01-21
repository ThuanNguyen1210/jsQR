const mqtt = require('mqtt');
const fs = require('fs');
const png = require('upng-js');
const jsqr = require('jsqr');

const NUM_OF_TEST = 5;
const EAST = 'East';
const WEST = 'West';
const SOUTH = 'South';
const NORTH = 'North';
const LEFT = 'Left';
const RIGHT = 'Right';
const PI = 3.14159265359;

function getDataFromImage(index) {
	const pathImg = fs.readFileSync(`./test/${index}/input.png`);
	const data = png.decode(pathImg);
	const rgb = png.toRGBA8(data);
	const newRgb = new Uint8ClampedArray(rgb[0]);

	const obj = {
		data: newRgb,
		height: data.height,
		width: data.width,
	};
	const code = jsqr(newRgb, data.width, data.height);

	return code;
}

function determineDirection(bottomLeft, topRight) {
	if (bottomLeft.x < topRight.x && bottomLeft.y > topRight.y) return NORTH;
	else if (bottomLeft.x > topRight.x && bottomLeft.y > topRight.y)
		return EAST;
	else if (bottomLeft.x > topRight.x && bottomLeft.y < topRight.y)
		return SOUTH;
	else if (bottomLeft.x < topRight.x && bottomLeft.y < topRight.y)
		return WEST;
}

function determineAngle(data) {
	const topLeft = data.location.topLeftFinderPattern;
	const topRight = data.location.topRightFinderPattern;
	const bottomLeft = data.location.bottomLeftFinderPattern;
	let horizontalVector;
	let verticalVector;
	if (data.direction == NORTH) {
		horizontalVector = {
			x: topRight.x - topLeft.x,
			y: topRight.y - topLeft.y,
		};
		verticalVector = {
			x: 0,
			y: -bottomLeft.y,
		};
	} else if (data.direction == EAST) {
		horizontalVector = {
			x: bottomLeft.x - topLeft.x,
			y: bottomLeft.y - topLeft.y,
		};
		verticalVector = {
			x: 0,
			y: -bottomLeft.y,
		};
	} else if (data.direction == SOUTH) {
		horizontalVector = {
			x: topLeft.x - topRight.x,
			y: topLeft.y - topRight.y,
		};
		verticalVector = {
			x: 0,
			y: -topRight.y,
		};
	} else if (data.direction == WEST) {
		horizontalVector = {
			x: topLeft.x - bottomLeft.x,
			y: topLeft.y - bottomLeft.y,
		};
		verticalVector = {
			x: 0,
			y: -topRight.y,
		};
	}

	const dotProduct =
		horizontalVector.x * verticalVector.x +
		horizontalVector.y * verticalVector.y;
	const modularProduct =
		Math.sqrt(
			horizontalVector.x * horizontalVector.x +
				horizontalVector.y * horizontalVector.y
		) *
		Math.sqrt(
			verticalVector.x * verticalVector.x +
				verticalVector.y * verticalVector.y
		);
	const cosine = dotProduct / modularProduct;

	const degree = (Math.acos(cosine) * 180) / PI;

	if (degree > 90.0 && degree < 180) {
		return {
			skewedSide: RIGHT,
			unit: degree - 90,
		};
	} else if (degree < 90 && degree > 0) {
		return {
			skewedSide: LEFT,
			unit: 90 - degree,
		};
	}
}

function writeOutput(index, data) {
	fs.writeFileSync(`./test/${index}/output.json`, JSON.stringify(data));
}

function main() {
	for (let index = 1; index < NUM_OF_TEST + 1; index++) {
		const data = getDataFromImage(index);
		if (!data) {
			writeOutput(index, {
				message: 'Cannot read data from QR Code. Please try again!',
			});
			continue;
		}

		data.direction = determineDirection(
			data.location.bottomLeftFinderPattern,
			data.location.topRightFinderPattern
		);
		const { location, direction } = data;
		data.directionCorrection = determineAngle({ location, direction });
		writeOutput(index, data);
	}
}

main();
