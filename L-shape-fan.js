let gl = null;

export function init() {
	const canvas = document.querySelector("#d3-canvas");
	gl = WebGLUtils.setupWebGL(canvas);

	if ( !gl ) { alert( "WebGL isn't available" ); }
	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

	const program = initShaders(gl, "vertex-shader","fragment-shader");
	gl.useProgram(program);

	const v1 = vec2(-0.75, -0.75);
	const v2 = vec2(-0.75, 0.75);
	const v3 = vec2(-0.35, 0.75);
	const v4 = vec2(-0.35, -0.35);
	const v5 = vec2(0.45, -0.35);
	const v6 = vec2(0.45, -0.75);

	const vertices = [
		v1,
		v2,
		v3,
		v4,
		v1,
		v5,
		v6,
	];

	const vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

	const vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);
	render();
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 7);
}
