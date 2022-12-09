import {html, relativeURL} from './utils.js';

class DragHandleElement extends HTMLElement {
	connectedCallback() {
		if (!this.shadowRoot) {
			this.attachShadow({mode: 'open'});
			this.shadowRoot.innerHTML = html`
				<link rel="stylesheet" href="${relativeURL('drag-handle-element.css')}">
				<slot></slot>
			`;
		}

		for (const eventType of ['dragstart', 'dragend', 'dragenter', 'dragover', 'dragleave', 'drop']) {
			this.addEventListener(eventType, this);
		}
	}

	handleEvent(event) {
		if (event.currentTarget !== event.target) return;
		switch (event.type) {
			case 'dragstart':
				console.log(this.parentNode.host);
				event.dataTransfer.setData('text/plain', this.parentNode.host.id);
				break;
		}
	}
}

if (!window.customElements.get('drag-handle')) {
	window.DragHandleElement = DragHandleElement;
	window.customElements.define('drag-handle', DragHandleElement);
}
