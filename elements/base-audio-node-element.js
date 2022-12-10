export class BaseAudioNodeElement extends HTMLElement {
	#disconnectedController;
	get disconnectedSignal() { return this.#disconnectedController.signal; }

	get controlElements() {
		return this.shadowRoot.querySelector(':host > fieldset')?.elements;
	}

	connectedCallback() {
		if (!this.shadowRoot) {
			this.attachShadow({mode: 'open'});
			this.shadowRoot.innerHTML = this.template(String.raw);
			this.#disconnectedController = new AbortController();
		}

		this.context = this.closest('audio-context').context;
		this.destination = this.parentElement instanceof AudioContextElement
			? this.context.destination
			: this.parentElement.node;
	}

	disconnectedCallback() {
		this.#disconnectedController.abort('element disconnected');
		this.node?.disconnect();
	}
}
