"use strict";

let gl = null;
let program = null;
let num_points = 3;
let center = vec2(0, 0);
let radius = 0.5;

export function init() {
	const canvas = document.querySelector("#d2-canvas");
	gl = WebGLUtils.setupWebGL(canvas);

	if ( !gl ) { alert( "WebGL isn't available" ); }
	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

	program = initShaders(gl, "vertex-shader","fragment-shader");
	gl.useProgram(program);
	start();
	const slider = document.querySelector("#d2-slider");
	slider.addEventListener('input', (e) => {
		num_points = parseInt(e.target.value, 10);
		setup_points();
	})
}

function start() {
	setup_points();
	render();
}

function setup_points() {
	const points = create_points(center, radius, num_points);
	const vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

	const vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

}

function create_points(cent, rad, k) {
  const points = [];
  points.push(center);

  const dAngle = 2 * Math.PI / k;
  for(let i = k; i >= 0; i--) {
    const a = i * dAngle;
    var p = vec2( rad*Math.sin(a) + cent[0], rad*Math.cos(a) + cent[1] );
    points.push(p);
  }
	return points;
}

function render() {
  gl.clear( gl.COLOR_BUFFER_BIT );
    // Draw circle using Triangle Fan
  gl.drawArrays(gl.TRIANGLE_FAN, 0, num_points + 2);

  window.requestAnimFrame(render);
}
