/* eslint-disable no-new */
/* eslint-disable no-console */

import {register} from '@shopify/theme-sections';
import {getUrlWithVariant, ProductForm} from '@shopify/theme-product-form';
import {formatMoney} from '@shopify/theme-currency';

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

const form = document.querySelector('.product__form');
const errorMessage = document.querySelector('.form__error');
const colorTitle = document.querySelector('.product__input-title--color');

class Quantity {
  destroy = () => {
    this.input.removeEventListener('input', this.handle);
    this.buttonDecrease.removeEventListener('click', this.decrease);
    this.buttonIncrease.removeEventListener('click', this.increase);
  };

  decrease = () => {
    errorMessage.innerHTML = '';
    const quantity = this.getValue();

    if (quantity > this.input.min) {
      this.setValue(quantity - 1);
    }
  };

  increase = () => {
    errorMessage.innerHTML = '';
    const quantity = this.getValue();

    if (quantity < this.input.max) {
      this.setValue(quantity + 1);
    }
  };

  handle = () => {
    errorMessage.innerHTML = '';
    const quantity = this.getValue();

    if (quantity < this.input.min) {
      this.setValue(1);
    } else if (quantity > this.input.max) {
      this.setValue(this.input.max);
    }
  };

  getValue = () => {
    return Number(this.input.value);
  };

  setValue = (newValue) => {
    this.input.value = newValue;
  };

  constructor(fieldset) {
    this.fieldset = fieldset;
    this.input = this.fieldset.querySelector('.product__quantity-input');
    this.buttonDecrease = this.fieldset.querySelector(
      '.product__quantity-button--decrease',
    );
    this.buttonIncrease = this.fieldset.querySelector(
      '.product__quantity-button--increase',
    );

    this.input.addEventListener('input', this.handle);
    this.buttonDecrease.addEventListener('click', this.decrease);
    this.buttonIncrease.addEventListener('click', this.increase);
  }
}

register('alternate-main-product', {
  accordions: {},
  productForm: null,
  quantityPicker: null,

  toggle(event) {
    const button = event.target.querySelector('.accordion__button');
    const id = button.getAttribute('aria-controls').split('--').pop();
    this.accordions[id].toggle();
  },

  onOptionChange(event) {
    errorMessage.innerHTML = '';
    const variant = event.dataset.variant;

    if (!variant) return;

    const url = getUrlWithVariant(window.location.href, variant.id);
    window.history.replaceState({path: url}, '', url);

    document.querySelector('.product__code--number').innerHTML = formatMoney(
      variant.price,
      '{{ amount_with_comma_separator }}',
    );

    if (variant.available) {
      document.querySelector('.button--add').disabled = false;
    } else {
      document.querySelector('.button--add').disabled = true;
      errorMessage.innerHTML = 'Temporarily unavailable';
    }

    event.dataset.options.forEach((el) => {
      if (el.name === 'Color') {
        colorTitle.innerHTML = el.value;
      }
    });
  },

  onFormSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    formData.append('sections', 'alternate-header');

    fetch(`${Shopify.routes.root}cart/add.js`, {
      method: event.target.method,
      body: formData,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.id) {
          const customEvent = new CustomEvent('cart:added', {
            detail: {
              updatedHeader: data.sections['alternate-header'],
            },
            bubles: true,
          });
          window.dispatchEvent(customEvent);
        } else {
          const message = `${data.message} (${data.status}): ${data.description}`;
          errorMessage.innerHTML = message;
          throw new Error(message);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  },

  onLoad() {
    const accordionButtons = document.querySelectorAll('.accordion__button');
    accordionButtons.forEach((el) => {
      this.accordions[new Accordion(el).id] = new Accordion(el);
    });

    const productHandle = form.dataset.handle;

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

    const fieldsetQuantity = form.querySelector('.product__fieldset--quantity');
    this.quantityPicker = new Quantity(fieldsetQuantity);

    const colorInputs = form.querySelectorAll('.product__input-radio--color');
    colorInputs.forEach((el) => {
      if (el.checked) {
        colorTitle.innerHTML = el.value;
      }
    });
  },

  onUnload() {
    for (const accordion of Object.values(this.accordions)) {
      accordion.destroy();
    }

    this.productForm.destroy();
  },

  onBlockSelect(evt) {
    this.toggle(evt);
  },

  onBlockDeselect(evt) {
    this.toggle(evt);
  },
});

document.addEventListener('DOMContentLoaded', () => {
  const accordions = document.querySelectorAll('.accordion__button');
  accordions.forEach((el) => {
    new Accordion(el);
  });
});
