import {register} from '@shopify/theme-sections';

register('alternate-header', {
  handleCartUpdate(event) {
    const header = new DOMParser().parseFromString(
      event.detail.updatedHeader,
      'text/html',
    );

    const targetCart = document.querySelector('.main-menu__counter');
    const parseCart = header.querySelector('.main-menu__counter');
    const accessibilityCart = document.querySelector(
      'span[aria-live=polite][class=visually-hidden]',
    );
    const quantity = parseCart.textContent.match(/\d+/)[0];

    targetCart.textContent = `Cart (${quantity})`;
    accessibilityCart.textContent = `Cart has ${quantity} item`;
  },

  onLoad() {
    window.addEventListener('cart:added', this.handleCartUpdate);
  },

  onUnload() {
    window.removeEventListener('cart:added', this.handleCartUpdate);
  },
});
