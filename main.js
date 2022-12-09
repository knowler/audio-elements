const customElements = [
	'audio-context',
	'biquad-filter-node',
	'gain-node',
	'oscillator-node',
	'stereo-panner-node',
	//'convolver-node',
];

performance.mark('begin waiting for custom elements to be defined');
await Promise.all(
	customElements.map(
		customElement => window.customElements.whenDefined(customElement),
	),
);
performance.mark('custom elements have been defined');
document.body.appendChild(
	document.querySelector('template').content.cloneNode(true),
);
