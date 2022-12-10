import { BaseAudioNodeElement } from './base-audio-node-element.js';
import { relativeURL } from "./utils.js";

export class BiquadFilterNodeElement extends BaseAudioNodeElement {
	static types = ['lowpass', 'highpass', 'bandpass', 'lowshelf', 'highshelf', 'peaking', 'notch', 'allpass'];
	type = 'lowpass';
	get type() { return this.getAttribute('type') ?? undefined; }
	set type(value) {
		this.setAttribute('type', value);
		if (this.node) this.node.type = value;
	}

	get Q() { return this.getAttribute('q') ?? undefined; }
	set Q(value) {
		this.setAttribute('q', value);
		this.node?.Q.setValueAtTime(Number(value), this.context.currentTime);
	}

	get gain() { return this.getAttribute('gain') ?? undefined; }
	set gain(value) {
		this.setAttribute('gain', value);
		this.node?.gain.setValueAtTime(Number(value), this.context.currentTime);
	}

	get detune() { return this.getAttribute('detune') ?? undefined; }
	set detune(value) {
		this.setAttribute('detune', value);
		this.node?.detune.setValueAtTime(Number(value), this.context.currentTime);
	}

	get frequency() { return this.getAttribute('frequency') ?? undefined; }
	set frequency(value) {
		this.setAttribute('frequency', value);
		this.node?.frequency.setValueAtTime(Number(value), this.context.currentTime);
	}

	template = html => html`
		<link rel="stylesheet" href="${relativeURL('biquad-filter-node-element.css')}">
		<fieldset>
			<legend>Biquad Filter</legend>
			<label>Type
				<select name="type">
					${BiquadFilterNodeElement.types.map(type => html`<option${this.type === type ? " selected" : ""}>${type}</option>`).join('')}
				</select>
			</label>
			<label>Frequency <input type="range" name="frequency" min="0" max="3000" value="${this.frequency ?? 350}"></label>
			<label>Detune <input type="range" name="detune" value="${this.detune ?? 0}"></label>
			<label>Q <input type="range" name="Q" min="0.0001" max="1000" step="0.0001" value="${this.q ?? 1}"></label>
			<label>Gain <input type="range" name="gain" min="-1" max="5" step="0.01" value="${this.gain ?? 1}"></label>
			<slot></slot>
		</fieldset>
	`;

	connectedCallback() {
		super.connectedCallback();

		this.node = new BiquadFilterNode(this.context, {
			type: this.type,
			frequency: this.frequency,
			detune: this.detune,
			Q: this.Q,
			gain: this.gain,
		});
		this.node.connect(this.destination);
		this.#setApplicableControls();

		for (const control of this.controlElements) {
			control.addEventListener('input', this.#handleControlInput.bind(this), {
				signal: this.disconnectedSignal,
			});
		}
	}

	#setApplicableControls() {
		switch (this.type) {
			case 'lowshelf': // q not used
			case 'highshelf': // q not used
				this.controlElements.namedItem('Q').disabled = true;
				this.controlElements.namedItem('gain').disabled = false;
			break;
			case 'notch':
			case 'allpass':
			case 'lowpass':
			case 'highpass':
			case 'bandpass':
				this.controlElements.namedItem('gain').disabled = true;
				this.controlElements.namedItem('Q').disabled = false;
			break;
			case 'peaking':
				this.controlElements.namedItem('gain').disabled = false;
				this.controlElements.namedItem('Q').disabled = false;
			break;
		}
	}

	static observedAttributes = ['type', 'frequency', 'detune', 'gain', 'q']
	attributeChangedCallback(name, oldValue, newValue) {
		if (!this.isConnected || !this.context || oldValue === newValue) return;
		switch (name) {
			case 'type':
				this.type = newValue;
				this.#setApplicableControls();
				break;
			case 'frequency':
			case 'detune':
			case 'gain':
				this[name] = Number(newValue);
				break;
			case 'q':
				this.Q = Number(newValue);
				break;
		}
	}

	#handleControlInput(event) {
		switch (event.target.name) {
			case 'type':
				this.type = event.target.value;
				this.#setApplicableControls();
				break;
			case 'frequency':
			case 'detune':
			case 'gain':
			case 'Q':
				this[event.target.name] = Number(event.target.value);
				break;
		}
	}
}

if (!window.customElements.get('biquad-filter-node')) {
	window.BiquadFilterNodeElement = BiquadFilterNodeElement;
	window.customElements.define('biquad-filter-node', BiquadFilterNodeElement);
}
