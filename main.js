const customElements = [
	'audio-context',
	'biquad-filter-node',
	'gain-node',
	'oscillator-node',
	'stereo-panner-node',
	//'convolver-node',
];

performance.mark('custom elements');
await Promise.all(
	customElements.map(
		customElement => window.customElements.whenDefined(customElement),
	),
);
performance.mark('custom elements');
document.body.appendChild(
	document.querySelector('template').content.cloneNode(true),
);
