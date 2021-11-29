"use strict";


interface Star {
	x: number,
	y: number,
	r: number
}


let canvas: HTMLCanvasElement;
let maxWidth: number;
let maxHeight: number;
let ctx: CanvasRenderingContext2D;
let stars: Star[];
let trail: number;
let frameCount: number;
let lastScrollTimestamp: number;
let isScrolling: boolean;
let preScrollY: number;
let lastDrawnFrame: number;


window.addEventListener("load", setup);


function setup(): void {
	// variable initialization
	canvas = document.getElementById("canvas") as HTMLCanvasElement;
	maxWidth = canvas.clientWidth;
	maxHeight = canvas.clientHeight;
	stars = createStars(0);
	trail = 0;
	lastScrollTimestamp = performance.now();
	isScrolling = false;
	preScrollY = getScrollY();
	lastDrawnFrame = 0;

	// set width & height on canvas
	canvas.width = maxWidth;
	canvas.height = maxHeight;

	// get canvas rendering context
	ctx = canvas.getContext("2d");

	// register handler for events
	window.addEventListener("scroll", onScroll);
	window.addEventListener("resize", onResize);
	
	// begin animation loop
	requestAnimationFrame(drawFrame);
}


function createStars(x: number): Star[] {
	const newStarPoints: Star[] = [];
	let y: number, r: number;

	while(x < maxWidth) {
		r = Math.round(Math.random() * 2) + 1;
		x += Math.round(Math.random() * 30) - 8;
		y = Math.round(Math.random() * (maxHeight - r)) + r;

		newStarPoints.push({x, y, r});
	}

	return newStarPoints;
}


function drawFrame(): void {
	if(getScrollY() !== preScrollY || trail !== 0 || lastDrawnFrame === 0) {
		ctx.clearRect(0, 0, maxWidth, maxHeight);

		drawStars();

		// if scrolling hasn't happened in the last 75 milliseconds, presume that we're done scrolling
		if(isScrolling && performance.now() > lastScrollTimestamp + 75) {
			isScrolling = false;
			preScrollY = getScrollY();
		}

		// decay the trail by a factor
		if(!isScrolling && (trail > 1 || trail < -1)) { 
			trail *= 0.9;
		}
		// if the trail is sub-pixel, then set it to 0
		if(trail < 1 && trail > -1) { 
			trail = 0;
		}
	}

	// increment the frame counter, and request to draw the next frame
	frameCount++;
	requestAnimationFrame(drawFrame);
}


function drawStars(): void {
	for(const star of stars) {
		ctx.beginPath();
		const lightness = 73 + (star.r * 5);
		ctx.fillStyle = `hsl(53, 85%, ${lightness}%)`;

		if(trail < 0.5 && trail > -0.5) {
			ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
			ctx.fill();
			trail = 0;
		}
		else {
			const leftX = star.x - star.r;
			const rightX = star.x + star.r;

			let topY: number, bottomY: number;

			// if star is above trail
			if(trail > 0) { 
				topY = star.y;
				bottomY = star.y + trail;
			}
			// if star is below trail
			else { 
				topY = star.y + trail;
				bottomY = star.y;
			}

			ctx.arc(star.x, topY, star.r, Math.PI, Math.PI * 2);
			ctx.fill();
			ctx.arc(star.x, bottomY, star.r, 0, Math.PI);
			ctx.fill();
			ctx.fillRect(leftX, topY, (rightX - leftX), (bottomY - topY));
		}
	}
}


function onScroll(): void {
	lastScrollTimestamp = performance.now();
	if(!isScrolling) {
		isScrolling = true;
	}

	const dampeningFactor = 0.4;
	let yDelta: number;

	if(getScrollY() < preScrollY) { // i.e. you've scrolled up
		yDelta = (preScrollY - getScrollY()) * -1;
	} else { // i.e. you've scrolled down
		yDelta = getScrollY() - preScrollY;
	}

	trail = yDelta * dampeningFactor;
}


function getScrollY(): number {
	// @ts-ignore
	return window.scrollY || (document.documentElement || document.body.parentNode || document.body).scrollTop;
}


function onResize(): void {
	const newWidth = canvas.clientWidth;
	const newHeight = canvas.clientHeight;

	const oldWidth = maxWidth;

	maxWidth = newWidth;
	maxHeight = newHeight;

	canvas.width = maxWidth;
	canvas.height = maxHeight;


	// screen has grown – add new stars in the new X space
	if(newWidth > oldWidth) {
		const furthestX = stars[stars.length - 1].x;

		stars = [...stars, ...createStars(furthestX)];
	}
	// screen has shrunk – remove any stars that were in the X space that was cut off
	else {
		let newEndIndex: number | null = null;
		for(let i = 0; i < stars.length; i++) {
			const star = stars[i];
			if(star.x > newWidth) {
				newEndIndex = i;
				break;
			}
		}
		if(newEndIndex !== null) {
			stars = stars.slice(0, newEndIndex);
		}
	}
}