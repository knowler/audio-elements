import { BaseAudioNodeElement } from "./base-audio-node-element.js";
import { relativeURL } from "./utils.js";

// TODO: improve reduction meter
class DynamicsCompressorNodeElement extends BaseAudioNodeElement {
	get #reductionMeter() {
		return this.shadowRoot.querySelector('meter');
	}
	template = html => html`
		<link rel="stylesheet" href="${relativeURL('dynamics-compressor-node-element.css')}">
		<fieldset>
			<legend>Compressor</legend>
			<label>
				Threshold
				<input name="threshold" type="range" min="-100" max="0" step="1" value="${this.threshold}">
			</label>
			<label>
				Knee
				<input name="knee" type="range" min="0" max="40" step="0.05" value="${this.knee}">
			</label>
			<label>
				Ratio
				<input name="ratio" type="range" min="1" max="20" step="1" value="${this.ratio}">
			</label>
			<label>
				Attack
				<input name="attack" type="range" min="0" max="1" step="0.001" value="${this.attack}">
			</label>
			<label>
				Release
				<input name="release" type="range" min="0" max="1" step="0.05" value="${this.release}">
			</label>
			<label>
				Reduction
				<meter min="-20" max="0" value="${this.reduction}"></meter>
			</label>
			<slot></slot>
		</fieldset>
	`;

	connectedCallback() {
		super.connectedCallback();
		this.node = new DynamicsCompressorNode(this.context, {
			threshold: this.threshold,
			knee: this.knee,
			ratio: this.ratio,
			attack: this.attack,
			release: this.release,
		});
		this.node.connect(this.destination);

		for (const control of this.controlElements) {
			control.addEventListener('input', this.#handleControlInput.bind(this), {
				signal: this.disconnectedSignal,
			});
		}
	}

	#handleControlInput(event) {
		switch(event.target.name) {
			case 'threshold':
			case 'knee':
			case 'ratio':
			case 'attack':
			case 'release':
				this[event.target.name] = Number(event.target.value);
				break;
		}
	}

	static observedAttributes = ['threshold', 'knee', 'ratio', 'reduction', 'attack', 'release'];
	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) return;

		let normalized;
		switch(name) {
			case 'threshold':
				normalized = newValue ? Number(newValue) : -24;
				break;
			case 'knee':
				normalized = newValue ? Number(newValue) : 30;
				break;
			case 'ratio':
				normalized = newValue ? Number(newValue) : 12;
				break;
			case 'attack':
				normalized = newValue ? Number(newValue) : 0.003;
				break;
			case 'release':
				normalized = newValue ? Number(newValue) : 0.25;
				break;
		}
		this.node?.[name].setValueAtTime(
			normalized,
			this.context.currentTime,
		);
		if (this.isConnected) {
			this.controlElements.namedItem(name).value = normalized;
			this.#reductionMeter.value = this.reduction;
		}
	}
	get threshold() {
		return Number(this.getAttribute('threshold') ?? -24);
	}
	set threshold(value) {
		this.setAttribute('threshold', value);
	}
	get knee() {
		return Number(this.getAttribute('knee') ?? 30);
	}
	set knee(value) {
		this.setAttribute('knee', value);
	}
	get ratio() {
		return Number(this.getAttribute('ratio') ?? 12);
	}
	set ratio(value) {
		this.setAttribute('ratio', value);
	}
	get attack() {
		return Number(this.getAttribute('attack') ?? 0.003);
	}
	set attack(value) {
		this.setAttribute('attack', value);
	}
	get release() {
		return Number(this.getAttribute('release') ?? 0.25);
	}
	set release(value) {
		this.setAttribute('release', value);
	}
	get reduction() {
		return this.node?.reduction ?? 0;
	}
}

if (!window.customElements.get('dynamics-compressor-node')) {
	window.DynamicsCompressorNodeElement = DynamicsCompressorNodeElement;
	window.customElements.define('dynamics-compressor-node', DynamicsCompressorNodeElement);
}
