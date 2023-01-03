
Shopify.theme.sections.register('alternate-header', {

  handleCartUpdate(evt) {
    const header = new DOMParser().parseFromString(
      evt.detail.updatedHeader,
      'text/html',
    );

    let targetCart = document.querySelector(".main-menu__counter")
    let parseCart = header.querySelector(".main-menu__counter")
    const accessibilityCart = document.querySelector('span[aria-live=polite][role=status]');
    const quantity = parseCart.textContent.match(/\d+/)[0];
    console.log(quantity)

    targetCart.textContent = `Cart (${quantity})`
    accessibilityCart.textContent = `Cart has ${quantity} item`;

  },

  onLoad() {
    window.addEventListener('cart:added', this.handleCartUpdate);
  },

  onUnload() {
    window.removeEventListener('cart:added', this.handleCartUpdate);
  },

  onSelect() { },

  onDeselect() { },

  onBlockSelect() { },

  onBlockDeselect() { },
});

