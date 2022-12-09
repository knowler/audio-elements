const customElements = [
	'audio-context',
	'biquad-filter-node',
	'gain-node',
	'oscillator-node',
	'stereo-panner-node',
	//'convolver-node',
];

performance.mark('waiting');
await Promise.all(
	customElements.map(
		customElement => window.customElements.whenDefined(customElement),
	),
);
performance.mark('defined');
performance.measure('custom elements to be defined', 'waiting', 'defined')
document.body.appendChild(
	document.querySelector('template').content.cloneNode(true),
);
