export default class CSlider {

	/**
	 * Initializes a new Slider object.
	 *
	 * @param {string} target - The target element selector where the slider will be created.
	 * @param {object} options - The options for the slider.
	 * @param {number} options.transitionSpeed - The speed of the slide transition in milliseconds.
	 * @param {boolean} options.arrowKeys - Whether to enable navigation using arrow keys.
	 * @param {boolean} options.autoplay - Whether to enable autoplay.
	 * @param {number} options.autoplaySpeed - The speed of autoplay in milliseconds.
	 * @param {boolean} options.buttons - Whether to show navigation buttons.
	 * @param {string} options.buttonTextNext - The text for the next button.
	 * @param {string} options.buttonTextPrev - The text for the previous button.
	 * @param {string} options.buttonWrapperNext - The selector for the next button wrapper.
	 * @param {string} options.buttonWrapperPrev - The selector for the previous button wrapper.
	 * @param {boolean} options.fixedHeight - Whether to use a fixed height for the slider.
	 * @param {boolean} options.moveOnClick - Whether to focus the slide when clicked.
	 * @param {boolean} options.pauseOnHover - Whether to pause autoplay when the mouse is over the slider.
	 * @param {boolean} options.singleMode - Whether to display only one slide at a time (slides will always fill the width of the container).
	 * @param {number} options.startPosition - The number (index + 1) of the slide to start with.
	 * @param {boolean} options.swipeNavigation - Whether to enable swipe navigation.
	 * @param {boolean} options.vertical - Whether to move the slides vertically.
	 * @param {boolean} options.wheelNavigation - Whether to enable wheel navigation.
	 * @param {function} options.beforeMove - The callback function to be called before the slides are changed.
	 * @param {function} options.afterMove - The callback function to be called after the slides are changed.
	 * @param {function} options.afterTransition - The callback function to be called after the slider transition is complete.
	 * @param {function} options.afterResize - The callback function to be called after the slider resize.
	 * @param {function} options.onReady - The callback function to be called after the slider initialization.
	 */
	constructor(target, options) {

		this.options = {
			arrowKeys: true,
			autoplay: false,
			autoplaySpeed: 6000,
			buttons: true,
			buttonTextNext: `<svg width="50" height="50" viewBox="0 0 100 100"><path fill="none" stroke="#000" stroke-width="8" d="M28.52 5l44.986 45.006L28.494 95"/></svg>`,
			buttonTextPrev: `<svg width="50" height="50" viewBox="0 0 100 100"><path fill="none" stroke="#000" stroke-width="8" d="M71.48 95L26.494 49.994 71.506 5" /></svg>`,
			buttonWrapperNext: target,
			buttonWrapperPrev: target,
			fixedHeight: true,
			moveOnClick: true,
			pauseOnHover: true,
			singleMode: false,
			startPosition: 0,
			swipeNavigation: true,
			transitionSpeed: 600,
			vertical: false,
			wheelNavigation: false,
			beforeMove() {return},
			afterMove() {return},
			afterTransition() {return},
			afterResize() {return},
			onReady() {}
		}
		Object.assign(this.options, options);

		if (this.options.vertical === true && options.wheelNavigation !== false) {
			this.options.wheelNavigation = true;
		}



		// ========================================================================== CREATE TRACK
		this.frame = document.querySelector(target);
		this.originalFrame = this.frame.cloneNode(true);

		if (!this.frame) {
			console.error('CSlider initialization error: Target element not found');
			return;
		}
		if (this.frame.children.length < 2) {
			console.error('CSlider initialization error: Needs at least 2 slides');
			return;
		}

		this.frame.style.setProperty('--csl-transition-speed', `${this.options.transitionSpeed}ms`);
		this.frame.classList.add(
			'csl-frame',
			this.options.vertical === true ? 'csl-vertical' : 'csl-horizontal',
			this.options.fixedHeight === true ? 'csl-height-fixed' : 'csl-height-auto',
			this.options.swipeNavigation === true ? 'csl-swipe' : 'csl-no-swipe',
		);

		if (this.options.swipeNavigation === true) {
			for (const img of this.frame.querySelectorAll('img')) {
				img.setAttribute('draggable', 'false');
			}
		}

		this.track = document.createElement('div');
		this.track.classList.add('csl-track');

		let oIndex = 0;
		for (const originalSlide of this.frame.children) {
			originalSlide.classList.add('csl-item');
			originalSlide.setAttribute('data-csl-oindex', oIndex);
			originalSlide.style.setProperty('--csl-oindex', oIndex);
			oIndex++;
		}

		while (this.frame.firstChild) {
			this.track.appendChild(this.frame.firstChild);
		}
		this.frame.appendChild(this.track);

		this.originalLength = this.frame.querySelectorAll('.csl-item').length;


		// ========================================================================== CALCULATE WIDTHS
		const calculateSizes = () => {
			this.slides = this.frame.querySelectorAll('.csl-item');

			let frameStyles = getComputedStyle(this.frame, null);

			if (this.options.vertical === true) {
					this.frameInnerSize = Math.round(
						this.frame.offsetHeight
						- parseInt(frameStyles.paddingTop)
						- parseInt(frameStyles.paddingBottom)
						- parseInt(frameStyles.borderTopWidth)
						- parseInt(frameStyles.borderBottomWidth)
					);
				}
			else {
				this.frameInnerSize = Math.round(
					this.frame.offsetWidth
					- parseInt(frameStyles.paddingLeft)
					- parseInt(frameStyles.paddingRight)
					- parseInt(frameStyles.borderLeftWidth)
					- parseInt(frameStyles.borderRightWidth)
				);
			}

			for (let slide of this.slides) {
				slide.style.removeProperty('--csl-size');
				const slideSize = this.options.vertical === true ? slide.offsetHeight : slide.offsetWidth;
				slide.style.setProperty('--csl-size', `${this.options.singleMode === true ? this.frameInnerSize : slideSize}px`);
			}
			this.track.classList.add('csl-sized');

			requestAnimationFrame(() => {
				this.trackSize = this.options.vertical === true ? this.track.offsetHeight : this.track.offsetWidth;

				// DUPLICATE SLIDES IF THERE ARE NOT ENOUGH
				let trackHTML = this.track.innerHTML;
				if (this.trackSize > 0) {
					const multiplier = options.vertical === true ? 5 : 4;
					this.oldTrackSize = this.trackSize;

					while (this.trackSize < this.frameInnerSize * multiplier) {
						this.track.insertAdjacentHTML('beforeend', trackHTML);
						this.trackSize = this.options.vertical === true ? this.track.offsetHeight : this.track.offsetWidth;

						if (this.oldTrackSize === this.trackSize) {
							console.log('Error duplicating slides: Track size did not change after insertion. Duplication aborted.');
							break;
						}
					}
					this.slides = this.frame.querySelectorAll('.csl-item');
				}

				addmoveOnClick();
			})
		}



		// ========================================================================== MOVE ON CLICK
		const focusOnSlide = (e, index) => {
			if (e.button === 0 && !this.swiping) {
				this.slideTo(index);
			}
		}

		const addmoveOnClick = () => {
			if (this.options.moveOnClick === true) {
				this.frame.classList.add('csl-focus');
				this.slides.forEach((item, index) => {
					item.removeEventListener('click', (e) => focusOnSlide.bind(this, e, index)());
					item.addEventListener('click', (e) => focusOnSlide.bind(this, e, index)());
				});
			}
		}



		// ========================================================================== SET START POSITION & ORDER
		const setStartPosition = () => {
			this.currentIndex = this.options.startPosition;
			this.currentSlide = this.slides[this.currentIndex];
			this.currentSlide.classList.add('csl-current');
		}


		const setOrder = () => {
			this.currentOrder = [];
			for (let i = 0; i < this.slides.length; i++) {
				this.currentOrder.push(i);
			}
		}



		// ========================================================================== GET CURRENT ORDER
		this.getCurrentOrder = () => {
			let firstIndex = this.currentIndex - Math.floor((this.slides.length - 1) / 2);
			if (firstIndex < 0) firstIndex += this.slides.length;

			let i = 0;
			while (this.currentOrder[0] != firstIndex) {
				if (++i > this.currentOrder.length) break;
				this.currentOrder.push(this.currentOrder.shift());
			}
			this.currentOrder.forEach((item, index) => {
				const relativeIndex = Math.floor((this.slides.length) / -2) + index + 1;
				this.slides[item].setAttribute('data-csl-order', index);
				this.slides[item].style.setProperty('--csl-order', index);
				this.slides[item].setAttribute('data-csl-relative', relativeIndex);
				this.slides[item].style.setProperty('--csl-relative', relativeIndex);
			});
		}



		// ========================================================================== START SLIDER
		const startSlider = () => {
			this.frame.classList.add('notrans');

			calculateSizes();

			requestAnimationFrame(() => {
				setStartPosition();
				setOrder();
				this.getCurrentOrder();
				this.slideTo(this.options.startPosition, 'init');

				requestAnimationFrame(() => {
					this.frame.classList.remove('notrans');
					if (this.options.autoplay === true) this.autoplayStart();
				})
			})



			// ========================================================================== PREV/NEXT BUTTONS
			if (this.options.buttons === true) {
				const createButtons = () => {
					const buttonWrapperPrev = document.querySelector(this.options.buttonWrapperPrev);
					if (buttonWrapperPrev) {
						const prevButton = document.createElement('button');
						prevButton.classList.add('csl-button', 'csl-button-prev');
						prevButton.setAttribute('aria-label', 'Previous slide');
						if (this.options.arrowKeys === true) prevButton.setAttribute('tabindex', '-1');
						prevButton.innerHTML = this.options.buttonTextPrev;
						this.prevButton = buttonWrapperPrev.appendChild(prevButton);
						prevButton.addEventListener('click', () => {
							this.prev();
						});
					}
					else {
						console.warn('Previous button wrapper element not found. Button will not be created.');
					}

					const buttonWrapperNext = document.querySelector(this.options.buttonWrapperNext);
					if  (buttonWrapperNext) {
						const nextButton = document.createElement('button');
						nextButton.classList.add('csl-button', 'csl-button-next');
						nextButton.setAttribute('aria-label', 'Next slide');
						if (this.options.arrowKeys === true) nextButton.setAttribute('tabindex', '-1');
						nextButton.innerHTML = this.options.buttonTextNext;
						this.nextButton = buttonWrapperNext.appendChild(nextButton);
						nextButton.addEventListener('click', () => {
							this.next();
						})
					}
					else {
						console.warn('Next button wrapper element not found. Button will not be created.');
					}
				}
				createButtons();
			}



			// ========================================================================== ARROW KEYS
			if (this.options.arrowKeys === true) {
				this.frame.setAttribute('tabindex', '0');
				let keyIsDown = false;

				const keynav = (e) => {
					if (!keyIsDown && e.key === (options.vertical === true ? 'ArrowUp' : 'ArrowLeft')) {
						this.prev();
						keyIsDown = true;
					}
					else if (!keyIsDown && e.key === (options.vertical === true ? 'ArrowDown' : 'ArrowRight')) {
						this.next();
						keyIsDown = true;
					}
					window.onkeyup = () => {
						keyIsDown = false;
					};
				}
				this.frame.addEventListener('keydown', keynav);
			}



			// ========================================================================== MOUSEWHEEL
			if (this.options.wheelNavigation === true) {
				let timeout = false;

				const mousewheelNav = (e) => {
					e.preventDefault();
					if (!timeout) {
						timeout = true;

						const delta = this.options.vertical ? e.deltaY : e.deltaX;

						if (delta < 0) {
							this.prev();
						}
						else {
							this.next();
						}

						setTimeout(() => {
							timeout = false;
						}, 100);
					}
				}
				this.frame.addEventListener('wheel', mousewheelNav);
			}



			// ========================================================================== ON WINDOW RESIZE
			this.resizer = () => {
				let resizeTimer;
				clearTimeout(resizeTimer);
				resizeTimer = setTimeout(() => {
					this.frame.classList.add('notrans');

					calculateSizes();

					requestAnimationFrame(() => {
						setOrder();
						this.getCurrentOrder();
						this.slideTo(this.currentIndex, 'resize');

						requestAnimationFrame(() => {
							addmoveOnClick();
							this.frame.classList.remove('notrans');
						})
					})
				}, 100)
			}
			window.addEventListener('resize', this.resizer);
		}

		if (document.readyState === "complete") {
			startSlider();
		}
		else {
			window.addEventListener('load', () => {
				startSlider();
			});
		}



		// ========================================================================== SWIPE NAVIGATION
		if (this.options.swipeNavigation === true) {
			const swipeStart = (device = 'mouse') => {
				const listeners = {
					start: device === 'mouse' ? 'mousedown' : 'touchstart',
					move: device === 'mouse' ? 'mousemove' : 'touchmove',
					end: device === 'mouse' ? 'mouseup' : 'touchend',
					cancel: device === 'mouse' ? 'mouseleave' : 'touchcancel'
				}

				return (e) => {
					if (device === 'mouse' && e.button !== 0) return;
					if(this.options.autoplay === true) clearTimeout(this.autoPlayTimeout);

					const coord = device === 'mouse' ? {
						x: e.clientX,
						y: e.clientY
					} : {
						x: e.changedTouches[0].clientX,
						y: e.changedTouches[0].clientY
					}

					const $slides = [...this.slides];

					this.frame.classList.add('notrans');
					let startPoint = this.options.vertical === true ? coord.y : coord.x;
					let origin = startPoint;


					// -------------------------------------------------------------------------- MOVE
					const swipeMove = (e) => {
						const coord = device === 'mouse' ? {
							x: e.clientX,
							y: e.clientY
						} : {
							x: e.changedTouches[0].clientX,
							y: e.changedTouches[0].clientY
						}
						let swipeTimeout = false;

						if (!swipeTimeout) {
							for (let slide of $slides) {
								const itemOffset = parseInt(window.getComputedStyle(slide).getPropertyValue('--csl-translate'));
								slide.style.setProperty('--csl-translate', `${itemOffset + (this.options.vertical === true ? coord.y : coord.x) - startPoint}px`);
							}

							swipeTimeout = true;
							this.swiping = true;
							startPoint = this.options.vertical === true ? coord.y : coord.x;

							setTimeout(() => {
								swipeTimeout = false;
							}, 10);
						}
					}


					// -------------------------------------------------------------------------- STOP
					const swipeEnd = (e) => {
						const coord = device === 'mouse' ? {
							x: e.clientX,
							y: e.clientY
						} : {
							x: e.changedTouches[0].clientX,
							y: e.changedTouches[0].clientY
						}
						let endPoint = this.options.vertical === true ? coord.y : coord.x;

						this.frame.classList.remove('notrans');
						document.removeEventListener('mouseup', swipeEnd);

						if (Math.abs(origin - endPoint) < 30) {
							this.slideTo(this.currentIndex);

							this.track?.removeEventListener(listeners.move, swipeMove);
							document.removeEventListener(listeners.end, swipeEnd);
							this.track?.removeEventListener(listeners.cancel, swipeEnd);
							this.swiping = false;

							return;
						};

						// find centermost slide
						const frameRect = this.frame.getBoundingClientRect();
						const frameCenter = this.options.vertical === true ? frameRect.y + frameRect.height / 2 : frameRect.x + frameRect.width / 2;

						let slideCenterPoints = [];

						for (let slide of $slides) {
							const slideRect = slide.getBoundingClientRect();
							const slideCenter = this.options.vertical === true ? slideRect.y + slideRect.height / 2 : slideRect.x + slideRect.width / 2;

							slideCenterPoints.push(Math.abs(frameCenter - slideCenter));
						}

						const closestSlideIndex = slideCenterPoints.indexOf(Math.min(...slideCenterPoints));
						const toIndex = $slides.indexOf($slides[closestSlideIndex]);

						if (this.currentIndex === toIndex) {
							if (origin - endPoint > 0) {
								this.next();
							}
							else {
								this.prev();
							}
						}
						else {
							this.slideTo(toIndex, 'swipe');
						}

						this.track?.removeEventListener(listeners.move, swipeMove);
						document.removeEventListener(listeners.end, swipeEnd);
						this.track?.removeEventListener(listeners.cancel, swipeEnd);
						this.swiping = false;
					}


					// -------------------------------------------------------------------------- ADD LISTENERS
					this.track.addEventListener(listeners.move, swipeMove);
					document.addEventListener(listeners.end, swipeEnd);
					this.track.addEventListener(listeners.cancel, swipeEnd);
				}
			}

			this.track.addEventListener('mousedown', swipeStart('mouse'));
			this.track.addEventListener('touchstart', swipeStart('touch'));
		}



		// ========================================================================== AUTOPLAY
		if (this.options.pauseOnHover === true) {
			this.frame.addEventListener('mouseenter', () => {
				this.autoplayPaused = true;
			});
			this.frame.addEventListener('mouseleave', () => {
				this.autoplayPaused = false;
			});
		}
	}



	// ###################################################################################### INIT END



	// ========================================================================== MOVE SLIDER
	slideTo(toIndex, init) {
		if (!this.slides[toIndex]) return;

		if (this.options.autoplay === true) {
			clearTimeout(this.autoPlayTimeout);

			this.autoPlayTimeout = setTimeout(() => {
				clearTimeout(this.autoPlayTimeout);

				if (this.autoplayPaused) {
					this.frame.addEventListener('mouseleave', () => {
						this.next();
					}, { once: true });
				}
				else {
					this.next();
				}
			}, Math.max(this.options.autoplaySpeed, this.options.transitionSpeed));
		}

		if (!init) this.options.beforeMove()

		// ---------------------------------------------------------------------- MARK SLIDES THAT NEED TO CHANGE SIDES
		const swapAmount = this.currentOrder.indexOf(this.currentIndex) - this.currentOrder.indexOf(toIndex);

		if (swapAmount < 0) {
			for (let i = 0; i < Math.abs(swapAmount); i++) {
				this.slides[this.currentOrder[i]].style.setProperty('--csl-transition-speed', '0ms');
			}
		}
		else {
			for (let i = this.currentOrder.length - 1; i >= this.currentOrder.length - swapAmount; i--) {
				this.slides[this.currentOrder[i]].style.setProperty('--csl-transition-speed', '0ms');
			}
		}


		// ---------------------------------------------------------------------- SET SLIDE CLASSES & MOVE SLIDES
		this.currentSlide = this.slides[toIndex];

		const currentOffset = this.options.vertical === true
			? this.currentSlide.offsetTop - this.frameInnerSize / 2 + this.currentSlide.offsetHeight / 2
			: this.currentSlide.offsetLeft - this.frameInnerSize / 2 + this.currentSlide.offsetWidth / 2;
		// index thresholds at which slides are wrapped around
		const overflowRight = toIndex + Math.floor(this.slides.length / 2);
		const overflowLeft = toIndex + 1 - Math.ceil(this.slides.length / 2);

		this.currentSlide.addEventListener('transitionend', () => {
			this.options.afterTransition();
		}, { once: true });

		this.slides.forEach((item, index) => {
			item.classList.remove('csl-next', 'csl-prev', 'csl-adjacent');

			// if slide needs to be swapped to the right
			if (overflowLeft > index) {
				item.style.setProperty('--csl-translate', `${(currentOffset - this.trackSize) * -1}px`);
				item.classList.add('csl-swapped-ltr');
			}
			// if slide needs to be swapped to the left
			else if (overflowRight < index) {
				item.style.setProperty('--csl-translate', `${(currentOffset + this.trackSize) * -1}px`);
				item.classList.add('csl-swapped-rtl');
			}
			else {
				item.style.setProperty('--csl-translate', `${currentOffset * -1}px`);
				item.classList.remove('csl-swapped-rtl');
				item.classList.remove('csl-swapped-ltr');
			}

			// add 'csl-after' class:
			// if slide is right sibling of current slide & its index is within the overflowRight threshold...
			if (index > toIndex && index <= overflowRight
				// ...or the slide is to the left of the overflowLeft threshold
				|| index < overflowLeft
			) {
				item.classList.remove('csl-before');
				item.classList.add('csl-after');
			}
			// add 'csl-before' class:
			// if slide is left sibling of current slide & its index is within the overflowLeft threshold...
			else if (index < toIndex && index >= overflowLeft
				// ...or the slide is to the right of the overflowRight threshold
				|| index > overflowRight
			) {
				item.classList.remove('csl-after');
				item.classList.add('csl-before');
			}

			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					item.style.removeProperty('--csl-transition-speed');
				})
			})
		});

		let nextSlideIndex = toIndex + 1 >= this.slides.length ? 0 : toIndex + 1;
		let previousSlideIndex = toIndex - 1 < 0 ? this.slides.length - 1 : toIndex - 1;

		this.slides[nextSlideIndex].classList.add('csl-next', 'csl-adjacent');
		this.slides[previousSlideIndex].classList.add('csl-prev', 'csl-adjacent');
		this.slides[this.currentIndex].classList.remove('csl-current');

		this.currentSlide.classList.remove('csl-after', 'csl-before');
		this.currentSlide.classList.add('csl-current');
		this.currentIndex = toIndex;
		this.currentOriginalIndex = toIndex % this.originalLength;

		this.getCurrentOrder();

		if (!init) {
			this.options.afterMove();
		}
		if (init === 'init') {
			console.log('CSlider ready!');
			this.options.onReady();
		}
		if (init === 'resize') {
			this.options.afterResize();
		}
	}



	// ========================================================================== PREV / NEXT METHODS
	prev() {
		this.slideTo(this.currentIndex - 1 < 0 ? this.slides.length - 1 : this.currentIndex - 1);
	}

	next() {
		this.slideTo(this.currentIndex + 1 > this.slides.length - 1 ? 0 : this.currentIndex + 1);
	}



	// ========================================================================== AUTOPLAY METHODS
	autoplayStart() {
		this.options.autoplay = true;
		this.slideTo(this.currentIndex);
	}

	autoplayStop() {
		this.options.autoplay = false;
		clearTimeout(this.autoPlayTimeout);
	}



	// ========================================================================== DESTROY
	destroy() {
		this.nextButton.remove();
		this.prevButton.remove();
		this.frame.insertAdjacentElement('beforebegin', this.originalFrame);
		this.frame.remove();
		window.removeEventListener('resize', this.resizer);
	}
}
