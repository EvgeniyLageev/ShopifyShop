import { register } from '@shopify/theme-sections';
import { getUrlWithVariant, ProductForm } from '@shopify/theme-product-form';
import { formatMoney } from '@shopify/theme-currency';


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


register("alternate-main-product", {
  accordions: {},
  productForm: null,

  toggle: function (event) {
    const button = event.target.querySelector('.accordion__button');
    const id = button.getAttribute('aria-controls').split('--').pop();
    this.accordions[id].toggle();
  },

  onOptionChange: function (event) {
    errorMessage.innerHTML = ""
    const variant = event.dataset.variant;
    console.log(variant)

    if (!variant) return;

    const url = getUrlWithVariant(window.location.href, variant.id);
    window.history.replaceState({ path: url }, '', url);

    document.querySelector(".product__code--number").innerHTML = formatMoney(
      variant.price,
      '{{ amount_with_comma_separator }}',
    );

    if (variant.available) {
      document.querySelector(".button--add").disabled = false;
    } else {
      document.querySelector(".button--add").disabled = true;
      errorMessage.innerHTML = "Temporarily unavailable"
    }
  },

  onFormSubmit: function (event) {
    event.preventDefault()
    let formData = new FormData(event.target);
    formData.append("sections", "alternate-header");

    fetch(`${Shopify.routes.root}cart/add.js`, {
      method: event.target.method,
      body: formData,
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
          errorMessage.innerHTML = message
          throw new Error(message);
        }
      })
      .catch(error => {
        console.log(error)
      })
  },

  onLoad: function () {
    const accordionButtons = document.querySelectorAll('.accordion__button');
    accordionButtons.forEach((el) => {
      this.accordions[new Accordion(el).id] = new Accordion(el);
    });


    const productHandle = form.dataset.handle;
    console.log(productHandle),


      fetch(`${Shopify.routes.root}products/${productHandle}.js`)
        .then((response) => {
          return response.json();
        })
        .then((productJSON) => {
          this.productForm = new ProductForm(form, productJSON, {
            onOptionChange: this.onOptionChange,
            onFormSubmit: this.onFormSubmit,
          });
        })
        .catch(console.error);

  },

  onUnload: function () {
    for (const accordion of Object.values(this.accordions)) {
      accordion.destroy();
    }

    this.productForm.destroy();
  },

  onSelect: function () {
  },

  onDeselect: function () {
  },

  onBlockSelect(evt) {
    this.toggle(evt)
  },

  onBlockDeselect(evt) {
    this.toggle(evt)
  },
});


document.addEventListener('DOMContentLoaded', () => {
  const accordions = document.querySelectorAll('.accordion__button');
  accordions.forEach((el) => {
    new Accordion(el);
  });
})
