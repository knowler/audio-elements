import { relativeURL } from "./utils";
const html = String.raw;

export class AudioContextElement extends HTMLElement {
	context = new AudioContext();

	connectedCallback() {
		if (!this.shadowRoot) {
			this.attachShadow({mode: 'open'});
			this.shadowRoot.innerHTML = html`
				<link rel="stylesheet" href="${relativeURL('audio-context-element.css')}">
				<slot></slot>
			`;
		}
	}
}

if (!window.customElements.get('audio-context')) {
	window.AudioContextElement = AudioContextElement;
	window.customElements.define('audio-context', AudioContextElement);
}
