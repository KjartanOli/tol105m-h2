let gl = null;
let program = null;
let max_depth = 0;

const cfg = [
	{
		producer: make_square,
		divider: divide_square,
		points: 5,
		origin: vec2(-1, 1),
	},
	{
		producer: make_triangle,
		divider: divide_triangle,
		points: 3,
		origin: vec2(0, 1),
	}
];

export async function init() {
	const canvas = document.querySelector("#d5-canvas");
	const radio = document.querySelectorAll("input[name=shape]");
	const slider = document.querySelector("input[name=max-depth]");

	max_depth = parseInt(slider.value, 10);

	gl = WebGLUtils.setupWebGL(canvas);

	if (!gl) { alert( "WebGL isn't available" ); }
	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

	program = initShaders(gl, "vertex-shader","fragment-shader");
	gl.useProgram(program);

	set_points(cfg[active_shape()]);

	radio.forEach(r => {
		r.addEventListener('change', e => {
			set_points(cfg[parseInt(e.target.value, 10)]);
		});
	});

	slider.addEventListener('input', e => {
		max_depth = parseInt(e.target.value, 10);
		set_points(cfg[active_shape()]);
	});
}

function active_shape() {
	return parseInt(document.querySelector("input[name=shape]:checked").value, 10);
}

async function set_points(cfg) {
	const points = (await serpinski(cfg.producer, cfg.divider, cfg.origin, 2, 2, 0));
	const vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

	const vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);
	render(Array.from({length: points.length / cfg.points}, (x, i) => ({
		start: i * cfg.points,
		length: cfg.points,
	})));
}

function render(slices) {
  gl.clear(gl.COLOR_BUFFER_BIT);
	slices.forEach(s => {
		gl.drawArrays(gl.TRIANGLE_STRIP, s.start, s.length);
	});
}

async function serpinski(make_shape, subdivide, o, w, h, d) {
	if (d > max_depth)
		return make_shape(o, w, h);

	return (await Promise.all(subdivide(o, w, h).map(async r => serpinski(make_shape, subdivide, ...r, d + 1)))).flat();
}

function divide_square(o, w, h) {
	const width = w / 3;
	const height = h / 3;
	return [
		o,
		add(o, vec2(width, 0)),
		add(o, vec2(2 * width, 0)),
		add(o, vec2(0, -height)),
		add(o, vec2(2 * width, -height)),
		add(o, vec2(0, -2 * height)),
		add(o, vec2(width, -2 * height)),
		add(o, vec2(2 * width, -2 * height))
	].map(p => [p, width, height]);
}

function make_square(o, w, h) {
	return [
		o,
		vec2(o[0] + w, o[1]),
		vec2(o[0] + w, o[1] - h),
		vec2(o[0], o[1] - h),
		o
	];
}

function divide_triangle(o, w, h) {
	const width = w / 2;
	const height = h / 2;
	return [
		o,
		add(o, vec2(-(width / 2), -height)),
		add(o, vec2(width / 2, -height)),
	].map(p => [p, width, height]);
}

function make_triangle(o, w, h) {
	return [
		o,
		add(o, vec2(-(w / 2), -h)),
		add(o, vec2(w / 2, -h)),
	];
}
