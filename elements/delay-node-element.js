import { BaseAudioNodeElement } from "./base-audio-node-element.js";
import { relativeURL } from "./utils.js";

class DelayNodeElement extends BaseAudioNodeElement {
	template = html => html`
		<link rel="stylesheet" href="${relativeURL('delay-node-element.css')}">
		<fieldset>
			<legend>Delay</legend>
			<label>
				Delay Time
				<input name="delayTime" type="range" min="0" max="1" step="0.01" value="${this.delayTime}">
			</label>
			<slot></slot>
		</fieldset>
	`;

	connectedCallback() {
		super.connectedCallback();

		this.node = new DelayNode(this.context, {
			delayTime: this.delayTime,
		});
		this.node.connect(this.destination);

		this.controlElements.namedItem('delayTime').addEventListener(
			'input',
			this.#handleControlInput.bind(this),
			{signal: this.disconnectedSignal},
		);
	}

	#handleControlInput(event) {
		if (event.target.name === 'delayTime') {
			this.delayTime = Number(event.target.value);
		}
	}

	static observedAttributes = ['delay-time'];
	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue) return;
		if (name === 'delay-time') {
			const normalized = newValue ? Number(newValue) : 0;
			this.node?.delayTime.setValueAtTime(normalized, this.context.currentTime);
			if (this.isConnected) this.controlElements.namedItem('delayTime').value = normalized;
		}
	}
	get delayTime() {
		return Number(this.getAttribute('delay-time') ?? 0)
	}
	set delayTime(value) {
		this.setAttribute('delay-time', value);
	}
}

if (!window.customElements.get('delay-node')) {
	window.DelayNodeElement = DelayNodeElement;
	window.customElements.define('delay-node', DelayNodeElement);
}
