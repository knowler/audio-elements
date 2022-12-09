import { html, relativeURL } from "./utils";

export class ConvolverNodeElement extends HTMLElement {
	get normalize() { return this.hasAttribute('normalize'); }
	set normalize(value) {
		this.toggleAttribute('normalize', value);
		this.node.normalize = value;
	}

	get #fieldsetElement() { return this.shadowRoot.querySelector('fieldset'); }

	template = () => html`
		<link rel="stylesheet" href="${relativeURL('convolver-node-element.css')}">
		<fieldset>
			<legend>Convolver</legend>
			<label>Normalize <input type="checkbox" name="normalize"${this.normalize ? ' checked' : ''}></label>
			<slot name="buffer">
				No buffers
			</slot>
			<slot></slot>
		</fieldset>
	`;
	connectedCallback() {
		if (!this.shadowRoot) {
			this.context = this.closest('audio-context').context;
			this.node = new ConvolverNode(this.context, {
				disableNormalization: !this.normalize,
			});

			if (this.parentElement instanceof AudioContextElement) this.destination = this.context.destination;
			else if ('node' in this.parentElement) this.destination = this.parentElement.node;
			this.node.connect(this.destination);

			this.attachShadow({mode: 'open'});
			this.shadowRoot.innerHTML = this.template();
		}

		this.#disconnectionController = new AbortController();
		for (const control of this.#fieldsetElement.elements) {
			control.addEventListener('input', this.#handleControlInput.bind(this), {
				signal: this.#disconnectionController.signal,
			});
		}
	}

	#disconnectionController;
	disconnectedCallback() {
		this.#disconnectionController.abort('element disconnected');
		this.node.disconnect();
	}

	static observedAttributes = ['disable-normalization'];
	attributeChangedCallback(name, oldValue, newValue) {
		if (!this.isConnected || !this.context || oldValue === newValue) return;

		switch(name) {
			case 'normalize':
				this.normalize = value === '' || value === 'normalize';
				break;
		}
	}

	#handleControlInput(event) {
		switch (event.target.name) {
			case 'normalize':
				this.normalize = event.target.checked;
		}
	}
}

if (!window.customElements.get('convolver-node')) {
	window.ConvolverNodeElement = ConvolverNodeElement;
	window.customElements.define('convolver-node', ConvolverNodeElement);
}
