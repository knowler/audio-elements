export class AudioContextElement extends HTMLElement {
	context = new AudioContext();

	connectedCallback() {
		if (!this.shadowRoot) {
			this.attachShadow({mode: 'open'});
			this.shadowRoot.innerHTML = `
				<link rel="stylesheet" href="/elements/audio-context-element.css">
				<slot></slot>
			`;
		}
	}
}

if (!window.customElements.get('audio-context')) {
	window.AudioContextElement = AudioContextElement;
	window.customElements.define('audio-context', AudioContextElement);
}
