const FIELD_SIZE = 10;
var gameData = new Array(FIELD_SIZE);
for(var i = 0; i < gameData.length; ++i) {
	gameData[i] = new Array(FIELD_SIZE);
}

const CELL_COLOR_R = 1;
const CELL_COLOR_G = 0;
const CELL_COLOR_B = 0;

// prep GL
const vertexShaderSrc = `#version 300 es

layout(location=0) in vec2 aPosition;
layout(location=1) in vec3 aColor;

out vec3 vColor;

void main()
{
	vColor = aColor;
	gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const fragmentShaderSrc = `#version 300 es

precision mediump float;

in vec3 vColor;

out vec4 fragColor;

void main()
{
	fragColor = vec4(vColor, 1.0);
}`;

const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl2');
const program = gl.createProgram();

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderSrc);
gl.compileShader(vertexShader);
gl.attachShader(program, vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderSrc);
gl.compileShader(fragmentShader);
gl.attachShader(program, fragmentShader);

gl.linkProgram(program);

if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
	console.log("shit's wrong!");
	console.log(gl.getShaderInfoLog(vertexShader));
	console.log(gl.getShaderInfoLog(fragmentShader));
}

gl.useProgram(program);

const bufferData = new Float32Array(1234);
const elementIndexData = new Uint8Array(1234);

// run shit
window.setInterval(() => {gameTick();}, 1000);

function gameTick() {
	populateGameData();

	updateGlCanvas();

	printDebugTable();
}

function populateGameData() {
	for(var i = 0; i < gameData.length; ++i) {
		for(var j = 0; j < gameData[i].length; ++j) {
			gameData[i][j] = Math.floor(Math.random() * 2);
		}
	}
}

function updateGlCanvas() {
	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	gl.clearDepth(1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	var yDelta = 2.0 / gameData.length;
	var xDelta = 2.0 / gameData[0].length;

	var yCur = 1.0;
	var xCur = -1.0;

	bufferDataIdx = 0;
	elemDataIdx = 0;

	var squareCnt = 0;
	var vertexCnt = 0;

	for(var i = 0; i < gameData.length; ++i) {
		for(var j = 0; j < gameData[i].length; ++j) {
			if(gameData[i][j] == 0) {
				xCur += xDelta;
				continue;
			}

			// vertex 1
			bufferData[bufferDataIdx++] = xCur;
			bufferData[bufferDataIdx++] = yCur;
			bufferData[bufferDataIdx++] = 1;
			bufferData[bufferDataIdx++] = 0;
			bufferData[bufferDataIdx++] = 0;

			// vertex 2
			bufferData[bufferDataIdx++] = xCur + xDelta;
			bufferData[bufferDataIdx++] = yCur;
			bufferData[bufferDataIdx++] = 0;
			bufferData[bufferDataIdx++] = 1;
			bufferData[bufferDataIdx++] = 0;

			// vertex 3
			bufferData[bufferDataIdx++] = xCur;
			bufferData[bufferDataIdx++] = yCur - yDelta;
			bufferData[bufferDataIdx++] = 0;
			bufferData[bufferDataIdx++] = 0;
			bufferData[bufferDataIdx++] = 1;

			// vertex 4
			bufferData[bufferDataIdx++] = xCur + xDelta;
			bufferData[bufferDataIdx++] = yCur - yDelta;
			bufferData[bufferDataIdx++] = 1;
			bufferData[bufferDataIdx++] = 0;
			bufferData[bufferDataIdx++] = 1;

			// update indices
			elementIndexData[elemDataIdx++] = vertexCnt;
			elementIndexData[elemDataIdx++] = vertexCnt + 1;
			elementIndexData[elemDataIdx++] = vertexCnt + 2;
			elementIndexData[elemDataIdx++] = vertexCnt + 1;
			elementIndexData[elemDataIdx++] = vertexCnt + 2;
			elementIndexData[elemDataIdx++] = vertexCnt + 3;

			xCur += xDelta;
			vertexCnt += 4;
			squareCnt++;
		}

		yCur -= yDelta;
		xCur = -1.0;
	}

	const POS_ATTRIB_LOC = 0;
	const COLOR_ATTRIB_LOC = 1;

	const buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, bufferData, gl.STATIC_DRAW);

	const elementIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementIndexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, elementIndexData, gl.STATIC_DRAW);

	gl.vertexAttribPointer(POS_ATTRIB_LOC, 2, gl.FLOAT, false, 5 * 4, 0);
	gl.vertexAttribPointer(COLOR_ATTRIB_LOC, 3, gl.FLOAT, false, 5 * 4, 2 * 4);

	gl.enableVertexAttribArray(POS_ATTRIB_LOC);
	gl.enableVertexAttribArray(COLOR_ATTRIB_LOC);

	console.log(squareCnt);

	gl.drawElements(gl.TRIANGLES, squareCnt * 6, gl.UNSIGNED_BYTE, 0);
}

function printDebugTable() {
	var t = document.querySelector('table');
	if(t) {
		t.remove();
	}

	var table = document.createElement('table');
	var tableBody = document.createElement('tbody');
	gameData.forEach(function(gameDataRow) {
		var row = document.createElement('tr');

		gameDataRow.forEach(function(cellData) {
			var cell = document.createElement('td');
			cell.appendChild(document.createTextNode(cellData));
			row.appendChild(cell);
		});

		tableBody.appendChild(row);
	});
	table.appendChild(tableBody);
	document.body.appendChild(table);
}