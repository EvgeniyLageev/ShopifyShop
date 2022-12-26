Shopify.theme.sections.register("alternate-main-product", {
  accordions: {},

  onLoad: function () {
    const accordionButtons = document.querySelectorAll('.accordion__button');
    for (let i = 0; i < accordionButtons.length; i++) {
      const accordion = new Accordion(accordionButtons[i]);
      this.accordions[accordion.id] = accordion;
    }
  },

  onUnload: function () {
    for (const accordion of Object.values(this.accordions)) {
      accordion.destroy();
    }
  },

  onSelect: function () {
  },

  onDeselect: function () {
  },

  onBlockSelect(evt) {

    const button = evt.target.querySelector('.accordion__button');
    const id = button.getAttribute('aria-controls').split('--').pop();
    this.accordions[id].toggle();
  },

  onBlockDeselect(evt) {
    const button = evt.target.querySelector('.accordion__button');
    const id = button.getAttribute('aria-controls').split('--').pop();
    this.accordions[id].toggle();
  },
});




class Accordion {
  constructor(button) {
    this.button = button;
    this.id = button.getAttribute('id').split('--').pop();
    this.description = document.getElementById(`description--${this.id}`);

    this.button.addEventListener('click', this.toggle.bind(this));
  }

  expand() {
    this.button.setAttribute('aria-expanded', 'true');
    this.description.removeAttribute('hidden');
  }

  collapse() {
    this.button.setAttribute('aria-expanded', 'false');
    this.description.setAttribute('hidden', '');
  }

  destroy() {
    this.button.removeEventListener('click', this.toggle.bind(this));
  }

  toggle() {
    if (this.button.getAttribute('aria-expanded') === 'true') {
      this.collapse();
    } else {
      this.expand();
    }
  }
}

// document.addEventListener('DOMContentLoaded', () => {
//   const accordions = document.querySelectorAll('.accordion__button');
//   accordions.forEach((el) => {
//     new Accordion(el);
//   });
// })
