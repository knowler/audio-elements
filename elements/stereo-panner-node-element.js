import {BaseAudioNodeElement} from './base-audio-node-element.js';
import {relativeURL} from './utils.js';

export class StereoPannerNodeElement extends BaseAudioNodeElement {
	get pan() { return this.getAttribute('pan'); }
	set pan(value) {
		this.setAttribute('pan', Number(value));
		this.node.pan.setValueAtTime(Number(value), this.context.currentTime);
	}

	template = html => html`
		<link rel="stylesheet" href="${relativeURL('stereo-panner-node-element.css')}">
		<fieldset>
			<legend>Pan</legend>
			<input type="range" name="pan" min="-1" max="1" value="0" step="0.01">
			<slot></slot>
		</fieldset>
	`;

	connectedCallback() {
		super.connectedCallback();

		this.node = new StereoPannerNode(this.context, {
			pan: Number(this.getAttribute('pan')) || undefined,
		});
		this.node.connect(this.destination);

		for (const control of this.controlElements) {
			control.addEventListener('input', this.#handleControlInput.bind(this), {
				signal: this.disconnectedSignal,
			});
		}
	}

	static observedAttributes = ['pan'];
	attributeChangedCallback(name, oldValue, newValue) {
		if (!this.isConnected || !this.context || oldValue === newValue) return;
		switch (name) {
			case 'pan': this.pan = Number(newValue); break;
		}
	}

	#handleControlInput(event) {
		switch (event.target.name) {
			case 'pan':
				this.pan = Number(event.currentTarget.value);
				break;
		}
	}
}

if (!window.customElements.get('stereo-panner-node')) {
	window.StereoPannerNodeElement = StereoPannerNodeElement;
	window.customElements.define('stereo-panner-node', StereoPannerNodeElement);
}
