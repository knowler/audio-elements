import {BaseAudioNodeElement} from './base-audio-node-element.js';
import { relativeURL } from './utils.js';

export class GainNodeElement extends BaseAudioNodeElement {
	get gain() { return this.getAttribute('gain'); }
	set gain(value) {
		this.setAttribute('gain', value);
		this.node.gain.setValueAtTime(value, this.context.currentTime);
	}

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
			<button type="button" name="mute" role="switch" aria-checked="false">Mute</button>
			<slot></slot>
		</fieldset>
	`;

	connectedCallback() {
		super.connectedCallback();

		this.node = new GainNode(this.context, {
			gain: Number(this.getAttribute('gain')) || undefined,
		});
		this.node.connect(this.destination);

		const {gain, mute} = this.controlElements;
		gain.addEventListener('input', this.#handleGainInput.bind(this), {
			signal: this.disconnectedSignal,
		});
		mute.addEventListener('click', this.#handleMuteClick.bind(this), {
			signal: this.disconnectedSignal,
		});
	}

	#handleGainInput(event) {
		this.mute = false;
		this.controlElements.mute.setAttribute('aria-checked', 'false');
		this.gain = Number(event.target.value);
	}

	#handleMuteClick(event) {
		const wasMuted = JSON.parse(event.currentTarget.getAttribute('aria-checked'));
		event.currentTarget.setAttribute('aria-checked', JSON.stringify(!wasMuted));
		this.mute = !wasMuted;
		if (this.mute) this.gain = 0;
		else this.gain = Number(this.controlElements.gain.value);
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

