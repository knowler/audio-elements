import { BaseAudioNodeElement } from './base-audio-node-element.js';
import {relativeURL} from './utils.js';

export class OscillatorNodeElement extends BaseAudioNodeElement {
	get waveform() {
		return this.getAttribute('waveform') ?? undefined;
	}
	set waveform(value) {
		this.setAttribute('waveform', value);
		if (this.node) this.node.type = value;
	}
	get frequency() { return this.getAttribute('frequency') ?? undefined; }
	set frequency(value) {
		this.setAttribute('frequency', value);
		this.node?.frequency.setValueAtTime(
			Number(value),
			this.context.currentTime,
		);
	}
	get detune() { return this.getAttribute('detune') ?? undefined; }
	set detune(value) {
		this.setAttribute('detune', value);
		this.node?.detune.setValueAtTime(
			Number(value),
			this.context.currentTime,
		);
	}

	started = false;
	async start() {
		await this.context.resume();
		this.node?.stop();
		this.node = new OscillatorNode(this.context, {
			type: this.waveform,
			frequency: this.frequency,
			detune: this.detune,
		});
		this.node.connect(this.destination);
		this.node.start();
		this.started = true;
	}

	stop() {
		this.node.stop();
		this.node = undefined;
		this.started = false;
	}

	template = html => html`
		<link rel="stylesheet" href="${relativeURL('oscillator-node-element.css')}">
		<fieldset>
			<legend>Oscillator</legend>
			<label>
				Waveform
				<select name="waveform">
					<option ${!this.waveform || this.waveform === "sine" ? "selected" : ""} value="sine">Sine</option>
					<option ${this.waveform === "square" ? "selected" : ""} value="square">Square</option>
					<option ${this.waveform === "sawtooth" ? "selected" : ""} value="sawtooth">Sawtooth</option>
					<option ${this.waveform === "triangle" ? "selected" : ""} value="triangle">Triangle</option>
				</select
			</label>
			<label>
				Frequency
				<input name="frequency" type="range" min="0" max="3000" value="${this.frequency ?? 440}">
			</label>
			<label>
				Detune
				<input name="detune" type="range" min="-100" max="100" value="${this.detune}">
			</label>
			<button type="button" role="switch" name="toggle">
				Toggle
			</button>
			<button type="button" name="remove">Remove</button>
		</fieldset>
	`;

	connectedCallback() {
		super.connectedCallback();

		const removeOnDisconnect = {signal: this.disconnectedSignal};
		const {waveform, frequency, detune, toggle, remove} = this.controlElements;
		frequency.addEventListener('input', this.#handleControlEvent.bind(this), removeOnDisconnect);
		detune.addEventListener('input', this.#handleControlEvent.bind(this), removeOnDisconnect);
		waveform.addEventListener('input', this.#handleControlEvent.bind(this), removeOnDisconnect);
		toggle.addEventListener('click', this.#handleControlEvent.bind(this), removeOnDisconnect);
		remove.addEventListener('click', this.#handleControlEvent.bind(this), removeOnDisconnect);
	}

	static observedAttributes = ['waveform', 'frequency', 'detune'];
	attributeChangedCallback(name, oldValue, newValue) {
		if (!this.isConnected || !this.context || oldValue === newValue) return;

		switch(name) {
			case 'frequency':
				this.frequency = Number(newValue);
				this.controlElements.namedItem('frequency').value = this.frequency;
				break;
			case 'detune':
				this.detune = Number(newValue);
				this.controlElements.namedItem('detune').value = this.detune;
				break;
			case 'waveform':
				this.waveform = newValue;
				this.controlElements.namedItem('waveform').value = this.waveform;
				break;
		}
	}

	#handleControlEvent(event) {
		switch (event.target.name) {
			case 'frequency':
			case 'detune':
				this[event.target.name] = Number(event.target.value);
				break;
			case 'waveform':
				this.waveform = event.target.value;
				break;
			case 'toggle':
				if (this.started) this.stop();
				else this.start();
				break;
			case 'remove':
				this.remove();
				break;
		}
	}
}

if (!window.customElements.get('oscillator-node')) {
	window.OscillatorNodeElement = OscillatorNodeElement;
	window.customElements.define('oscillator-node', OscillatorNodeElement);
}
