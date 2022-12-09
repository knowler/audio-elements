import {BaseShadowElement} from './base-shadow-element.js';
import {relativeURL} from './utils.js';

export class StereoPannerNodeElement extends BaseShadowElement {
	get pan() { return this.getAttribute('pan'); }
	set pan(value) {
		this.setAttribute('pan', Number(value));
		this.node.pan.setValueAtTime(Number(value), this.context.currentTime);
	}

	get #controlElements() { return this.shadowRoot.querySelector('fieldset').elements; }
	template = html => html`
		<link rel="stylesheet" href="${relativeURL('stereo-panner-node-element.css')}">
		<fieldset>
			<legend>Pan</legend>
			<input type="range" name="pan" min="-1" max="1" value="0" step="0.01">
			<slot></slot>
		</fieldset>
	`;

	connectedCallback() {
		if (!this.shadowRoot) {
			this.context = this.closest('audio-context').context;

			this.node = new StereoPannerNode(this.context, {
				pan: Number(this.getAttribute('pan')) || undefined,
			});

			if (this.parentElement instanceof AudioContextElement) this.destination = this.context.destination;
			else if ('node' in this.parentElement) this.destination = this.parentElement.node;
			this.node.connect(this.destination);
		}

		super.connectedCallback();

		for (const control of this.#controlElements) {
			control.addEventListener('input', this.#handleControlInput.bind(this), {
				signal: this.disconnectedSignal,
			});
		}
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this.node.disconnect();
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
