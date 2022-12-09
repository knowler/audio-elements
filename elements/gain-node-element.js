import {BaseShadowElement} from './base-shadow-element.js';
import { relativeURL } from './utils.js';

export class GainNodeElement extends BaseShadowElement {
	get gain() { return this.node.gain.value; }
	set gain(value) { this.node.gain.setValueAtTime(value, this.context.currentTime); }

	get #controlElements() { return this.shadowRoot.querySelector('fieldset').elements; }
	template = html => html`
		<link rel="stylesheet" href="${relativeURL('gain-node-element.css')}">
		<fieldset>
			<legend>Gain</legend>
			<label>Level
				<input name="gain" type="range" list="gain-values" min="0" max="2" step="0.01" value="${this.gain}">
				<datalist id="gain-values">
					<option value="0" label="min"></option>
					<option value="2" label="max"></option>
				</datalist>
			</label>
			<label>Mute <input type="checkbox" name="mute"></label>
			<slot></slot>
		</fieldset>
	`;

	connectedCallback() {
		if (!this.shadowRoot) {
			this.context = this.closest('audio-context').context;
			this.node = new GainNode(this.context, {
				gain: Number(this.getAttribute('gain')) || undefined,
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

	#handleControlInput(event) {
		switch (event.target.name) {
			case 'gain':
				this.mute = false;
				this.#controlElements.mute.checked = false;
				this.gain = Number(event.target.value);
				break;
			case 'mute':
				this.mute = event.target.checked;
				if (this.mute) this.gain = 0;
				else this.gain = Number(this.#controlElements.gain.value);
				break;
		}
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this.node.disconnect();
	}

	static observedAttributes = ['gain'];
	attributeChangedCallback(name, oldValue, newValue) {
		if (!this.isConnected || !this.context || oldValue === newValue) return;
		switch (name) {
			case 'gain': this.gain = Number(newValue); break;
		}
	}
}

if (!window.customElements.get('gain-node')) {
	window.GainNodeElement = GainNodeElement;
	window.customElements.define('gain-node', GainNodeElement);
}

