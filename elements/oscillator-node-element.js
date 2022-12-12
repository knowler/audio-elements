import { BaseAudioNodeElement } from './base-audio-node-element.js';
import { relativeURL } from './utils.js';

const TYPES = ['sine', 'square', 'sawtooth', 'triangle'];

export class OscillatorNodeElement extends BaseAudioNodeElement {
	template = html => html`
		<link rel="stylesheet" href="${relativeURL('oscillator-node-element.css')}">
		<fieldset>
			<legend>Oscillator</legend>
			<label>
				Type
				<select name="type">
					${TYPES.map(type => html`<option${type === this.type ? " selected" : ""}>${type}</option>`).join('')}
				</select>
			</label>
			<label>
				Frequency
				<input name="frequency" type="range" min="0" max="3000" value="${this.frequency}">
			</label>
			<label>
				Detune
				<input name="detune" type="range" min="-100" max="100" value="${this.detune}">
			</label>
			<button type="button" name="toggle" role="switch" aria-checked="false">
				Toggle
			</button>
			<button type="button" name="remove">Remove</button>
		</fieldset>
	`;

	connectedCallback() {
		super.connectedCallback();

		for (const control of this.controlElements) {
			control.addEventListener(
				control.name === 'toggle' || control.name === 'remove' ? 'click' : 'input',
				this.#handleControlEvent.bind(this),
				{ signal: this.disconnectedSignal },
			);
		}
	}

	#handleControlEvent(event) {
		switch (event.target.name) {
			case 'type':
				this.type = event.target.value;
				break;
			case 'frequency':
			case 'detune':
				this[event.target.name] = Number(event.target.value);
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

	static observedAttributes = ['type', 'frequency', 'detune'];
	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) return;
		// Set normalized value and update AudioNode value.
		let normalized;
		switch (name) {
			case 'type':
				normalized = newValue ?? 'sine';
				if (this.node) this.node.type = normalized;
				break;
			case 'frequency':
				normalized = newValue ? Number(newValue) : 440;
				this.node?.frequency.setValueAtTime(normalized, this.context.currentTime);
				break;
			case 'detune':
				normalized = newValue ? Number(newValue) : 0;
				this.node?.detune.setValueAtTime(normalized, this.context.currentTime);
				break;
		}
		// Update control
		this.controlElements.namedItem(name).value = normalized;
	}
	get type() {
		return this.getAttribute('type') ?? 'sine';
	}
	set type(value) {
		this.setAttribute('type', value);
	}
	get frequency() {
		return this.getAttribute('frequency') ?? 440;
	}
	set frequency(value) {
		this.setAttribute('frequency', value);
	}
	get detune() {
		return this.getAttribute('detune') ?? 0;
	}
	set detune(value) {
		this.setAttribute('detune', value);
	}

	get started() {
		return JSON.parse(this.controlElements.toggle.getAttribute('aria-checked'));
	}
	set started(value) {
		this.controlElements.toggle.setAttribute('aria-checked', JSON.stringify(value));
	}
	async start() {
		if (!this.isConnected) return;
		await this.context.resume();
		this.node?.stop();
		this.node = new OscillatorNode(this.context, {
			type: this.type,
			frequency: this.frequency,
			detune: this.detune,
		});
		this.node.connect(this.destination);
		this.node.start();
		this.started = true;
	}
	stop() {
		if (!this.isConnected) return;
		this.node.stop();
		this.node.disconnect();
		delete this.node;
		this.started = false;
	}

}

if (!window.customElements.get('oscillator-node')) {
	window.OscillatorNodeElement = OscillatorNodeElement;
	window.customElements.define('oscillator-node', OscillatorNodeElement);
}
