let gl = null;
let program = null;
const circles = [];
const circle_points = 20;

export function init() {
	const canvas = document.querySelector("#d4-canvas");
	gl = WebGLUtils.setupWebGL(canvas);

	if (!gl) { alert( "WebGL isn't available" ); }
	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

	program = initShaders(gl, "vertex-shader","fragment-shader");
	gl.useProgram(program);

	render();
	canvas.addEventListener('click', (e) => {
		const p = get_cursor_location(e);
		add_circle(p);
	});
}

function get_cursor_location(event) {
	const canvas = event.target;

	const x = (event.offsetX / canvas.clientWidth) * 2 - 1;
	const y = -((event.offsetY / canvas.clientHeight) * 2 - 1);
	return vec2(x, y);
}

function add_circle(centre) {
	circles.push(create_circle(centre, Math.random() * 0.1, circle_points));
	set_points(circles);
}

function set_points(circles) {
	const vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(circles.flat()), gl.STATIC_DRAW);

	const vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);
}

function create_circle(centre, radius, k) {
  const points = [];
  points.push(centre);

  const dAngle = 2 * Math.PI / k;
  for(let i = k; i >= 0; i--) {
    const a = i * dAngle;
    var p = vec2(radius * Math.sin(a) + centre[0], radius * Math.cos(a) + centre[1]);
    points.push(p);
  }
	return points;
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
	circles.forEach((c, i) => {
		gl.drawArrays(gl.TRIANGLE_FAN, i * c.length, c.length);
	});

  window.requestAnimFrame(render);
}
