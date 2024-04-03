# CSlider: Dependency-free slider with full style control

CSlider is a pure JS infinite slider with minimal CSS overhead and no default theme.

- [Usage](#usage)
- [Styling](#styling)
- [Options](#options)
- [Callbacks](#callbacks)
- [Methods](#methods)

## Usage

Copy `cslider.min.js` and `cslider.min.css` into your project.

In the `<head>` of your HTML, add the following:

```js
<link rel="stylesheet" href="css/cslider.min.css">
<script type="module" defer>
  import CSlider from './js/cslider.min.js';
  const slider = new CSlider('.slider_element', options);
</script>
```

where `.slider_element` is the CSS selector for your slider element, and `options` is an optional object containing [options](#options) and [callbacks](#callbacks) for the slider.  
  
In the `<body>` of your HTML, add your slides as direct children of the `.slider_element` :

```html
<div class="slider_element">
  <div>Slide 1</div>
  <div>Slide 2</div>
  <div>Slide 3</div>
</div>
```

## Styling

Use the following classes to style your slides:

-	`.csl-adjacent` - both the next and previous slides
-	`.csl-after` - slides that appear after the current slide
-	`.csl-before` - slides that appear before the current slide
-	`.csl-current` - the current slide
-	`.csl-item` - any slide
-	`.csl-next` - the next slide
-	`.csl-prev` - the previous slide
-	`.csl-swapped-ltr` - slides with lower index (their position in the DOM) than the current slide, but which appear to the right (bottom for vertical sliders) of the current slide
-	`.csl-swapped-rtl` - slides with higher index (their position in the DOM) than the current slide, but which appear to the left (top for vertical sliders) of the current slide

Additionally, use the following data-attributes to determine the position of a slide:

-	`[data-csl-oindex]` - the original index of the slide before duplication.
-	`[data-csl-order]` - the current **visual** position of the slide, from left to right (top to bottom for vertical sliders). The first slide has an order of 0. Note that this is not the same as the index of the slide in the DOM.
-	`[data-csl-relative]` - the current **visual** position of the slide, relative to the current slide. The current slide has a relative position of 0. Slides to the right (top for vertical sliders) of the current slide have positive relative positions. Slides to the left (bottom for vertical sliders) of the current slide have negative relative positions.

The same values are also avalaible as corresponding CSS custom properties `--csl-oindex`, `--csl-order`, and `--csl-relative` for use in CSS calculations.

CSlider will duplicate slides as necessary such that there are always enough to ensure smooth transitions. To access the index of a slide after duplication, simply use the `:nth-child()` pseudo-class.  
**Note:** the index refers to the slide's position in the DOM, which does not change when the slider moves, since no deletion or duplication is done on move. However, resizing the viewport may append additional slides if necessary.

## Options

-	**arrowKeys (boolean)**  
	Enable navigation via arrow keys. Uses left/right keys for horizontal sliders and up/down keys for vertical sliders.  
	*default: true*
-	**autoplay (boolean)**  
	Enable autoplay.  
	*default: false*
-	**autoplaySpeed (number)**  
	Speed at which slides change when autoplay is enabled, in milliseconds.  
	*default: 6000*
-	**buttons (boolean)**  
	Render *previous/next* navigation buttons.  
	*default: true*
-	**buttonTextNext (string)**  
	Text to show on the *next* button.  
	*defaults to an svg icon*
-	**buttonTextPrev (string)**  
	Text to show on the *previous* button.  
	*defaults to an svg icon*
-	**buttonWrapperNext (string)**  
	CSS Selector of the element to which the *next* button should be appended.  
	*defaults to the* `.slider_element` *to which the slider is attached*
-	**buttonWrapperPrev (string)**  
	CSS Selector of the element to which the *previous* button should be appended.  
	*defaults to the* `.slider_element` *to which the slider is attached*
-	**fixedHeight (boolean)**  
	Enable fixed height and make slides fit within the height of the slider. Must set a height via css for the `.slider_element`. If false, the height of the `.slider_element` will grow to match the tallest slide. Has no effect on vertical sliders.  
	*default: true*
-	**moveOnClick (boolean)**  
	Make slides clickable and move slider to the clicked slide if true.  
	*default: true*
-	**multiplier (number)**  
	To ensure smooth transitions, slides will get duplicated until the track element is this times as wide as the frame.  
	*default: 4*
-	**pauseOnHover (boolean)**  
	Pause autoplay on mouseover event.  
	*default: true*
-	**singleMode (boolean)**  
	Make each slide fill the width of the slider (or the height if slider is vertical).  
	*default: false*
-	**startPosition (number)**  
	Index of the slide to center on initial load. Indices start from 0.  
	*default: 0*
-	**swipeNavigation (boolean)**  
	Enable navigation via swiping (touch) or dragging (mouse).  
	*default: true*
-	**transitionSpeed (number)**  
	Speed of the slider transition, in milliseconds.  
	*default: 600*
-	**vertical (boolean)**  
	Enable vertical mode. Affects arrow key and wheel navigation, button orientation, fixedHeight and singleMode logic.  
	*default: false*
-	**wheelNavigation (boolean)**  
	Enable navigation via mouse wheel on vertical sliders.  
	*default: false*

## Callbacks

Callbacks can be defined as properties on the options object:

```js
slider = new CSlider('.slider_element', {
  onReady: () => {
    // do something
  }
});
```

-	**beforeMove()**  
	Called before the start of each slider navigation.
-	**afterMove()**  
	Called immediately after each slider navigation, after positions have been calculated and css classes have been applied, but before transition has ended.
-	**afterTransition()**  
	Called after each slider navigation, after transition has ended.
-	**afterResize()**  
	Called after the viewport size has changed and the slider has finished its necessary calculations.
-	**onReady()**  
	Called the first time the slider is ready.

## Methods

Use the following methods to control the slider after creation, e.g.

```js
slider.slideTo(2); // move to the third slide (of index 2)
```

-	**autoplayStart()**  
	Start autoplay.
-	**autoplayStop()**  
	Stop autoplay.
-	**destroy()**  
	Destroy the slider and restore the original DOM.
-	**next()**  
	Move to the next slide.
-	**prev()**  
	Move to the previous slide.
-	**slideTo(index)**  
	Move to slide of the specified index (as in the DOM). Direction of movement is determined by relative position to the current slide.
