const customElements = [
	'audio-context',
	'biquad-filter-node',
	'gain-node',
	'oscillator-node',
	'stereo-panner-node',
	//'convolver-node',
];

await Promise.all(
	customElements.map(
		customElement => window.customElements.whenDefined(customElement),
	),
);
console.log('custom elements defined');
document.body.appendChild(
	document.querySelector('template').content.cloneNode(true),
);
