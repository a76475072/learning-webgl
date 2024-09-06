const vertexShaderSource = `#version 300 es

uniform float uPointSize;
uniform vec2 uPosition;

in float aPointSize;
in vec2 aPosition;
in vec3 aColor;

out vec3 vColor;

void main() 
{
	vColor = aColor;
	gl_Position = vec4(aPosition, 0.0, 1.0);
	gl_PointSize = aPointSize;
}`;

const fragmentShaderSource = `#version 300 es

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
gl.shaderSource(vertexShader, vertexShaderSource);
gl.compileShader(vertexShader);
gl.attachShader(program, vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderSource);
gl.compileShader(fragmentShader);
gl.attachShader(program, fragmentShader);

gl.linkProgram(program);

// if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
// 	console.log(gl.getShaderInfoLog(vertexShader));
// 	console.log(gl.getShaderInfoLog(fragmentShader));
// }

gl.useProgram(program);

const bufferData = new Float32Array([
	0, 0,      100,     1,0,0,
	.5,-.8,    32,      0,1,0,
	-.9,.5,    50,      0,0,1,
]);

const aPositionLoc = gl.getAttribLocation(program, 'aPosition');
const aPointSizeLoc = gl.getAttribLocation(program, 'aPointSize');
const aColorLoc = gl.getAttribLocation(program, 'aColor');

gl.enableVertexAttribArray(aPositionLoc);
gl.enableVertexAttribArray(aPointSizeLoc);
gl.enableVertexAttribArray(aColorLoc);

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, bufferData, gl.STATIC_DRAW);

gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 6 * 4, 0);
gl.vertexAttribPointer(aPointSizeLoc, 1, gl.FLOAT, false, 6 * 4, 2 * 4);
gl.vertexAttribPointer(aColorLoc, 3, gl.FLOAT, false, 6 * 4, 3 * 4);

gl.drawArrays(gl.TRIANGLES, 0, 3);
