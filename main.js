const template = document.querySelector('template');

await Promise.all(
	Array
		// Get all the unique custom elements in the template
		.from(template.content.querySelectorAll(':not(:defined):first-of-type'))
		// Use the tag names to get the whenDefined promises
		.map(customElement => window.customElements.whenDefined(customElement.tagName.toLowerCase())),
);

document.body.appendChild(template.content.cloneNode(true));
