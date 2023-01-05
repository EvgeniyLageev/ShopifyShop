import { register } from '@shopify/theme-sections';


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

const form = document.querySelector(".product__form")
const errorMessage = document.querySelector(".form__error")
form.addEventListener("submit", event => {
  event.preventDefault()
  fetch(event.target.action + ".js", {
    method: event.target.method,
    body: new FormData(event.target),
    headers: {
      "X-Requested-With": "XMLHttpRequest"
    }
  }).then(response => response.json())
    .then((data) => {
      if (data.id) {
        const event = new CustomEvent("cart:added", {
          detail: {
            updatedHeader: data.sections['alternate-header'],
          },
          bubles: true
        })
        window.dispatchEvent(event);
      } else {
        const message = `${data.message} (${data.status}): ${data.description}`;
        throw new Error(message);
      }
    })
    .catch(error => {
      errorMessage.innerHTML = error
    })
})



register("alternate-main-product", {
  accordions: {},

  onLoad: function () {
    const accordionButtons = document.querySelectorAll('.accordion__button');
    accordionButtons.forEach((el) => {
      this.accordions[new Accordion(el).id] = new Accordion(el);
    });
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


document.addEventListener('DOMContentLoaded', () => {
  const accordions = document.querySelectorAll('.accordion__button');
  accordions.forEach((el) => {
    new Accordion(el);
  });
})
