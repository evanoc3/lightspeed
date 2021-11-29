"use strict";

const canvas = document.getElementById("canvas");
const canvasWidth = canvas.clientWidth;
const canvasHeight = canvas.clientHeight;
const ctx = canvas.getContext("2d");

canvas.width = canvasWidth;
canvas.height = canvasHeight;


let stars = getStars();
let starTrail = 0;
let frameCount = 0;
let lastScrollTimestamp = performance.now();
let isScrolling = false;
let preScrollY = getScrollY();



function animateFrame() {
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	// ctx.fillStyle = "#030527";
	// ctx.fillRect(0, 0, canvasWidth, canvasHeight);

	drawStars(ctx, stars, starTrail);

	if(isScrolling && performance.now() > lastScrollTimestamp + 75) {
		isScrolling = false;
		preScrollY = getScrollY();
	}

	if(!isScrolling && (starTrail > 1 || starTrail < -1)) {
		starTrail *= 0.9;
	}
	if(starTrail < 1 && starTrail > -1) {
		starTrail = 0;
	}

	frameCount++;
	window.requestAnimationFrame(animateFrame);
}

window.requestAnimationFrame(animateFrame);


function getStars() {
	let newStarPoints = [];
	let x = 0, y, r;

	while(x < canvasWidth) {
		r = Math.round(Math.random() * 2) + 1;
		x += Math.round(Math.random() * 30) - 8;
		y = Math.round(Math.random() * (canvasHeight - r)) + (r * 0.5);

		newStarPoints.push({x, y, r});
	}

	return newStarPoints;
}


function drawStars(ctx, stars) {
	for(const star of stars) {
		ctx.beginPath();
		const lightness = 73 + (star.r * 5);
		ctx.fillStyle = `hsl(53, 85%, ${lightness}%)`;

		if(starTrail < 0.5 && starTrail > -0.5) {
			ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
			ctx.fill();
			starTrail = 0;
		}
		else {
			const leftX = star.x - star.r;
			const rightX = star.x + star.r;

			let topY, bottomY;

			if(starTrail > 0) { // star is above trail
				topY = star.y;
				bottomY = star.y + starTrail;
			}
			else { // star is below trail
				topY = star.y + starTrail;
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


window.addEventListener("scroll", () => {
	lastScrollTimestamp = performance.now();
	if(!isScrolling) {
		isScrolling = true;
	}

	const dampeningFactor = 0.4;
	let delta;

	if(getScrollY() < preScrollY) { // i.e. you've scrolled up
		delta = (preScrollY - getScrollY()) * -1;
	} else { // i.e. you've scrolled down
		delta = getScrollY() - preScrollY;
	}

	starTrail = delta * dampeningFactor;
});


function getScrollY() {
	return window.scrollY || (document.documentElement || document.body.parentNode || document.body).scrollTop;
}
