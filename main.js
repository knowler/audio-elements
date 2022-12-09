const customElements = [
	'audio-context',
	'biquad-filter-node',
	'gain-node',
	'oscillator-node',
	'stereo-panner-node',
	'convolver-node',
];

await Promise.all(
	customElements.map(
		customElement => window.customElements.whenDefined(customElement),
	),
);

document.body.appendChild(
	document.querySelector('template').content.cloneNode(true),
);
