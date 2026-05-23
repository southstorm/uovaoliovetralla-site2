(function () {
  const whatsappNumber = "393204167331";

  const checkoutConfig = {
    // Option 1: set this to your Stripe/Mollie/serverless checkout endpoint.
    // The endpoint should accept POST JSON: { items, currency, locale, total } and return { url }.
    endpoint: "",

    // Option 2: paste gateway-hosted payment links here for fixed single-product checkout.
    // Example: "chicken-6": "https://buy.stripe.com/..."
    paymentLinks: {}
  };

  const products = {
    "chicken-6": {
      price: 3,
      labels: {
        it: "6 uova di gallina",
        en: "6 chicken eggs",
        fr: "6 oeufs de poule",
        nl: "6 kippeneieren"
      }
    },
    "chicken-12": {
      price: 5.5,
      labels: {
        it: "12 uova di gallina",
        en: "12 chicken eggs",
        fr: "12 oeufs de poule",
        nl: "12 kippeneieren"
      }
    },
    "duck-6": {
      price: 4,
      labels: {
        it: "6 uova di anatra",
        en: "6 duck eggs",
        fr: "6 oeufs de cane",
        nl: "6 eendeneieren"
      }
    },
    "duck-12": {
      price: 7.5,
      labels: {
        it: "12 uova di anatra",
        en: "12 duck eggs",
        fr: "12 oeufs de cane",
        nl: "12 eendeneieren"
      }
    }
  };

  const copy = {
    it: {
      title: "Carrello",
      empty: "Il carrello e vuoto.",
      total: "Totale",
      checkout: "Paga ordine",
      fallback: "Invia ordine su WhatsApp",
      clear: "Svuota",
      message: "Ciao, vorrei ordinare:",
      delivery: "Preferisco ritiro in fattoria o consegna del venerdi a Viterbo."
    },
    en: {
      title: "Cart",
      empty: "Your cart is empty.",
      total: "Total",
      checkout: "Pay order",
      fallback: "Send order on WhatsApp",
      clear: "Clear",
      message: "Hi, I would like to order:",
      delivery: "I prefer farm pickup or Friday delivery in Viterbo."
    },
    fr: {
      title: "Panier",
      empty: "Votre panier est vide.",
      total: "Total",
      checkout: "Payer la commande",
      fallback: "Envoyer sur WhatsApp",
      clear: "Vider",
      message: "Bonjour, je voudrais commander :",
      delivery: "Je prefere le retrait a la ferme ou la livraison du vendredi a Viterbe."
    },
    nl: {
      title: "Winkelwagen",
      empty: "Je winkelwagen is leeg.",
      total: "Totaal",
      checkout: "Bestelling betalen",
      fallback: "Bestelling via WhatsApp",
      clear: "Legen",
      message: "Hallo, ik wil graag bestellen:",
      delivery: "Ik verkies afhalen op de boerderij of vrijdaglevering in Viterbo."
    }
  };

  const locale = document.documentElement.lang in copy ? document.documentElement.lang : "it";
  const strings = copy[locale];
  const currency = new Intl.NumberFormat(locale === "en" ? "en-IE" : locale, {
    style: "currency",
    currency: "EUR"
  });
  const cartEl = document.querySelector("[data-cart]");
  const cart = new Map();

  function productLabel(id) {
    return products[id].labels[locale] || products[id].labels.en;
  }

  function cartItems() {
    return [...cart.entries()].map(([id, quantity]) => ({
      id,
      quantity,
      label: productLabel(id),
      unitPrice: products[id].price,
      lineTotal: products[id].price * quantity
    }));
  }

  function cartTotal() {
    return cartItems().reduce((sum, item) => sum + item.lineTotal, 0);
  }

  function makeWhatsAppUrl() {
    const lines = cartItems().map((item) => {
      return `- ${item.quantity} x ${item.label} (${currency.format(item.lineTotal)})`;
    });
    const message = `${strings.message}\n${lines.join("\n")}\n${strings.total}: ${currency.format(cartTotal())}\n${strings.delivery}`;
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  }

  async function checkout() {
    const items = cartItems();
    if (!items.length) return;

    if (checkoutConfig.endpoint) {
      const response = await fetch(checkoutConfig.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, currency: "EUR", locale, total: cartTotal() })
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
    }

    if (items.length === 1 && items[0].quantity === 1 && checkoutConfig.paymentLinks[items[0].id]) {
      window.location.href = checkoutConfig.paymentLinks[items[0].id];
      return;
    }

    window.location.href = makeWhatsAppUrl();
  }

  function renderCart() {
    if (!cartEl) return;

    const items = cartItems();
    if (!items.length) {
      cartEl.innerHTML = `
        <div class="cart-header">
          <h3>${strings.title}</h3>
          <span>0</span>
        </div>
        <p class="cart-empty">${strings.empty}</p>
      `;
      return;
    }

    const rows = items.map((item) => `
      <li class="cart-row">
        <div>
          <strong>${item.label}</strong>
          <span>${currency.format(item.unitPrice)}</span>
        </div>
        <div class="quantity-controls">
          <button type="button" data-cart-minus="${item.id}" aria-label="Remove one">-</button>
          <span>${item.quantity}</span>
          <button type="button" data-cart-plus="${item.id}" aria-label="Add one">+</button>
        </div>
      </li>
    `).join("");

    cartEl.innerHTML = `
      <div class="cart-header">
        <h3>${strings.title}</h3>
        <span>${items.reduce((sum, item) => sum + item.quantity, 0)}</span>
      </div>
      <ul class="cart-list">${rows}</ul>
      <div class="cart-total">
        <span>${strings.total}</span>
        <strong>${currency.format(cartTotal())}</strong>
      </div>
      <div class="cart-actions">
        <button class="button primary" type="button" data-checkout>${checkoutConfig.endpoint ? strings.checkout : strings.fallback}</button>
        <button class="button cart-clear" type="button" data-cart-clear>${strings.clear}</button>
      </div>
    `;
  }

  function revealCart() {
    if (!cartEl) return;

    cartEl.classList.remove("cart-panel-highlight");
    cartEl.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => {
      cartEl.classList.add("cart-panel-highlight");
    }, 180);
  }

  document.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-product-id]");
    const plusButton = event.target.closest("[data-cart-plus]");
    const minusButton = event.target.closest("[data-cart-minus]");
    const clearButton = event.target.closest("[data-cart-clear]");
    const checkoutButton = event.target.closest("[data-checkout]");

    if (addButton) {
      const id = addButton.dataset.productId;
      cart.set(id, (cart.get(id) || 0) + 1);
      renderCart();
      revealCart();
    }

    if (plusButton) {
      const id = plusButton.dataset.cartPlus;
      cart.set(id, (cart.get(id) || 0) + 1);
      renderCart();
    }

    if (minusButton) {
      const id = minusButton.dataset.cartMinus;
      const next = (cart.get(id) || 0) - 1;
      if (next > 0) cart.set(id, next);
      else cart.delete(id);
      renderCart();
    }

    if (clearButton) {
      cart.clear();
      renderCart();
    }

    if (checkoutButton) {
      checkout().catch(() => {
        window.location.href = makeWhatsAppUrl();
      });
    }
  });

  renderCart();
})();
