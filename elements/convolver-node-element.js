import {BaseAudioNodeElement} from './base-audio-node-element.js';
import {relativeURL} from "./utils.js";

export class ConvolverNodeElement extends BaseAudioNodeElement {
	get normalize() { return this.hasAttribute('normalize'); }
	set normalize(value) {
		this.toggleAttribute('normalize', value);
		this.node.normalize = value;
	}

	template = html => html`
		<link rel="stylesheet" href="${relativeURL('convolver-node-element.css')}">
		<fieldset>
			<legend>Convolver</legend>
			<label>Normalize <input type="checkbox" name="normalize"${this.normalize ? ' checked' : ''}></label>
			<slot name="buffer">
				No buffers
			</slot>
			<slot></slot>
		</fieldset>
	`;
	connectedCallback() {
		super.connectedCallback();

		this.node = new ConvolverNode(this.context, {
			disableNormalization: !this.normalize,
		});
		this.node.connect(this.destination);

		for (const control of this.controlElements) {
			control.addEventListener('input', this.#handleControlInput.bind(this), {
				signal: this.disconnectedSignal,
			});
		}
	}

	static observedAttributes = ['disable-normalization'];
	attributeChangedCallback(name, oldValue, newValue) {
		if (!this.isConnected || !this.context || oldValue === newValue) return;

		switch(name) {
			case 'normalize':
				this.normalize = value === '' || value === 'normalize';
				break;
		}
	}

	#handleControlInput(event) {
		switch (event.target.name) {
			case 'normalize':
				this.normalize = event.target.checked;
		}
	}
}

if (!window.customElements.get('convolver-node')) {
	window.ConvolverNodeElement = ConvolverNodeElement;
	window.customElements.define('convolver-node', ConvolverNodeElement);
}
