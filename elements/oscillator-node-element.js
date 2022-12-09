import {html, relativeURL} from './utils.js';

export class OscillatorNodeElement extends HTMLElement {
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
	start() {
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

	get #fieldsetElement() { return this.shadowRoot.querySelector('fieldset'); }

	template = () => html`
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
			<button role="switch" name="toggle">
				Toggle
			</button>
		</fieldset>
	`;

	connectedCallback() {
		if (!this.shadowRoot) {
			this.context = this.closest('audio-context').context;

			if (this.parentElement instanceof AudioContextElement) this.destination = this.context.destination;
			else if ('node' in this.parentElement) this.destination = this.parentElement.node;

			this.attachShadow({mode: 'open'});
			this.shadowRoot.innerHTML = this.template();
		}

		this.#disconnectionController = new AbortController();
		const removeOnDisconnect = {signal: this.#disconnectionController.signal};

		const {waveform, frequency, detune, toggle} = this.#fieldsetElement.elements;

		frequency.addEventListener('input', this.#handleFrequencyInput.bind(this), removeOnDisconnect);
		detune.addEventListener('input', this.#handleDetuneInput.bind(this), removeOnDisconnect);
		waveform.addEventListener('input', this.#handleWaveformInput.bind(this), removeOnDisconnect);
		toggle.addEventListener('click', this.#handleToggleClick.bind(this), removeOnDisconnect);
	}

	#disconnectionController;
	disconnectedCallback() {
		this.#disconnectionController.abort('element disconnected');
	}

	static observedAttributes = ['waveform', 'frequency', 'detune'];
	attributeChangedCallback(name, oldValue, newValue) {
		if (!this.isConnected || !this.context || oldValue === newValue) return;

		switch(name) {
			case 'frequency':
				this.frequency = Number(newValue);
				this.#fieldsetElement.elements.namedItem('frequency').value = this.frequency;
				break;
			case 'detune':
				this.detune = Number(newValue);
				this.#fieldsetElement.elements.namedItem('detune').value = this.detune;
				break;
			case 'waveform':
				this.waveform = newValue;
				this.#fieldsetElement.elements.namedItem('waveform').value = this.waveform;
				break;
		}
	}

	#handleFrequencyInput(event) {
		this.frequency = Number(event.target.value);
	}

	#handleDetuneInput(event) {
		this.detune = Number(event.target.value);
	}

	#handleWaveformInput(event) {
		this.waveform = event.target.value; 
	}

	#handleToggleClick() {
		if (this.started) this.stop();
		else this.start();
	}
}

if (!window.customElements.get('oscillator-node')) {
	window.customElements.whenDefined('audio-context');
	window.OscillatorNodeElement = OscillatorNodeElement;
	window.customElements.define('oscillator-node', OscillatorNodeElement);
}
