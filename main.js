const customElements = [
	'audio-context',
	'biquad-filter-node',
	'gain-node',
	'oscillator-node',
	'stereo-panner-node',
	'convolver-node',
];

Promise.all(
	customElements.map(
		customElement => window.customElements.whenDefined(customElement),
	),
).then(() => {
	document.body.appendChild(
		document.querySelector('template').content.cloneNode(true),
	);
});

