


class Accordion {
  constructor(button) {
    this.button = button;
    const number = button.getAttribute('id').split('--').pop();
    this.description = document.getElementById(`accordion__section--${number}`);
    // this.button.setAttribute('aria-expanded', false);
    // this.button.setAttribute('aria-controls', `${this.description.id}`);
    // this.description.setAttribute('hidden', '');
    // this.description.setAttribute('aria-labelledby', `${this.button.id}`);

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

  toggle() {
    if (this.button.getAttribute('aria-expanded') === 'true') {
      this.collapse();
    } else {
      this.expand();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const accordions = document.querySelectorAll('.accordion__button');
  accordions.forEach((el) => {
    new Accordion(el);
  });
})
