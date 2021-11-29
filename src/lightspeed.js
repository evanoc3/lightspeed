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
let preScrollYOffset = window.pageYOffset;



function animateFrame() {
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	ctx.fillStyle = "#030527";
	ctx.fillRect(0, 0, canvasWidth, canvasHeight);

	drawStars(ctx, stars, starTrail);

	if(isScrolling && performance.now() > lastScrollTimestamp + 75) {
		isScrolling = false;
		preScrollYOffset = window.pageYOffset;
	}

	if(!isScrolling && starTrail > 1) {
		starTrail *= 0.9;
	}

	frameCount++;
	window.requestAnimationFrame(animateFrame);
}

window.requestAnimationFrame(animateFrame);


function getStars() {
	let newStarPoints = [];
	let x = 0;

	while(x < canvasWidth) {
		let r = Math.round(Math.random() * 3) + 2;
		x += Math.round(Math.random() * 30) - 8;
		let y = Math.round(Math.random() * (canvasHeight - r)) + (r * 0.5);

		newStarPoints.push({x, y, r});
	}

	return newStarPoints;
}


function drawStars(ctx, stars, trail) {
	for(const star of stars) {
		ctx.beginPath();
		ctx.fillStyle = "#f3e366";

		if(trail < 0.5) {
			ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
			ctx.fill();
			trail = 0;
		}
		else {
			const leftX = star.x - star.r;
			const rightX = star.x + star.r;
			const trailY = star.y + trail;

			let starStartAngle, starEndAngle, trailStartAngle, trailEndAngle;
			let topY, bottomY;

			if(trail > 0) { // star is above trail
				topY = star.y;
				bottomY = star.y + trail;
			}
			else { // star is below trail
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


function onScroll(e) {
	lastScrollTimestamp = performance.now();
	if(!isScrolling) {
		isScrolling = true;
	}

	const dampener = 0.5;

	if(pageYOffset < preScrollYOffset) {
		starTrail = (preScrollYOffset - window.pageYOffset) * dampener;
	} else {
		starTrail = (window.pageYOffset - preScrollYOffset) * dampener;
	}
}

window.addEventListener("scroll", onScroll);