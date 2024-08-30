'use strict';

let gl = null;
let program = null;

const cfg = [
	{
		producer: make_square,
		divider: divide_square,
		subdivisions: 8,
		points: 6,
		dimension: 2,
		origin: vec2(-1, 1),
	},
	{
		producer: make_triangle,
		divider: divide_triangle,
		subdivisions: 3,
		points: 3,
		dimension: 2,
		origin: vec2(0, 1),
	}
];

export async function init() {
	const canvas = document.querySelector("#d5-canvas");
	const radio = document.querySelectorAll("input[name=shape]");
	const slider = document.querySelector("input[name=max-depth]");

	const max_depth = parseInt(slider.max, 10);

	gl = WebGLUtils.setupWebGL(canvas);

	if (!gl) {
		alert( "WebGL isn't available" );
		return;
	}
	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

	program = initShaders(gl, "vertex-shader","fragment-shader");
	gl.useProgram(program);

	const vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, cfg.map(c => 4 * c.dimension * c.points * Math.pow(c.subdivisions, max_depth)).reduce((a, b) => Math.max(a, b), 0), gl.STATIC_DRAW);

	set_points(cfg[active_shape()], parseInt(slider.value, 10));

	radio.forEach(r => {
		r.addEventListener('change', e => {
			set_points(cfg[parseInt(e.target.value, 10)], get_depth());
		});
	});

	slider.addEventListener('input', e => {
		set_points(cfg[active_shape()],  parseInt(e.target.value, 10));
	});
}

function get_depth() {
	return parseInt(document.querySelector("input[name=max-depth]").value, 10)
}

function active_shape() {
	return parseInt(document.querySelector("input[name=shape]:checked").value, 10);
}

async function set_points(cfg, depth) {
	const points = (await serpinski(cfg.producer, cfg.divider, cfg.origin, 2, 2, depth));

	gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));

	const vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, cfg.dimension, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);
	render(points);
}

function render(points) {
  gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.TRIANGLES, 0, points.length);
}

async function serpinski(make_shape, subdivide, o, w, h, d) {
	if (d <= 0)
		return make_shape(o, w, h);

	return (await Promise.all(subdivide(o, w, h).map(async r => serpinski(make_shape, subdivide, ...r, d - 1)))).flat();
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
		add(o, vec2(w, 0)),
		add(o, vec2(w, -h)),
		o,
		add(o, vec2(0, -h)),
		add(o, vec2(w, -h)),
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
