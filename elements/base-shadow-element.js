export class BaseShadowElement extends HTMLElement {
	#disconnectedController;
	get disconnectedSignal() { return this.#disconnectedController.signal; }

	connectedCallback() {
		if (!this.shadowRoot) {
			this.attachShadow({mode: 'open'});
			this.shadowRoot.innerHTML = this.template(String.raw);
			this.#disconnectedController = new AbortController();
		}
	}

	disconnectedCallback() {
		this.#disconnectedController.abort('element disconnected');
	}
}
