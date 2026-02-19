import ClientApp from "./clientApp";

export default function Page() {
  return (
    <div className="page">
      <header className="top">
        <div className="top-left">
          <nav className="primary-nav" aria-label="Main">
            <a href="#">Home</a>
            <a href="#about">About</a>
            <a href="https://www.instagram.com" target="_blank" rel="noreferrer">Instagram</a>
          </nav>
          <a className="email" href="mailto:ajimenezh29@yahoo.com">ajimenezh29@yahoo.com</a>
        </div>

        <div className="top-right">
          <button id="menuBtn" className="menu-btn" type="button" aria-expanded="false" aria-controls="mobileNav">
            MENU
          </button>
          <a id="bagBtn" className="bag" href="#">BAG (0)</a>
        </div>
      </header>

      <nav id="mobileNav" className="mobile-nav" aria-label="Mobile">
        <a href="#">Home</a>
        <a href="#about">About</a>
        <a href="https://www.instagram.com" target="_blank" rel="noreferrer">Instagram</a>
        <a href="mailto:ajimenezh29@yahoo.com">ajimenezh29@yahoo.com</a>
      </nav>

      <main>
        <h1># SUPPLY 10</h1>
        <section id="products" className="product-grid" aria-label="Recent Work"></section>
      </main>

      <dialog id="detailDialog" className="detail-dialog">
        <article className="detail-content">
          <header className="detail-header">
            <h2 id="detailTitle"></h2>
            <button id="detailCloseBtn" type="button" className="menu-btn">Close</button>
          </header>
          <div id="detailViewer" className="detail-viewer">
            <button id="detailPrevBtn" className="detail-nav" type="button" aria-label="Previous media">&lt;</button>
            <div id="detailMediaFrame" className="detail-media-frame"></div>
            <button id="detailNextBtn" className="detail-nav" type="button" aria-label="Next media">&gt;</button>
          </div>
          <p id="detailMeta" className="meta"></p>
          <p id="detailDescription"></p>
          <div id="detailSizeRow" className="detail-size-row" hidden>
            <label htmlFor="detailSizeSelect">Size</label>
            <select id="detailSizeSelect"></select>
            <p id="detailSizeHint" className="meta"></p>
          </div>
          <div className="detail-buy-row">
            <p id="detailPrice" className="meta"></p>
            <div className="detail-action-row">
              <button id="detailAddToCartBtn" type="button" className="menu-btn">Add to Cart</button>
              <button id="detailBuyBtn" type="button" className="buy-btn">Buy</button>
            </div>
          </div>
        </article>
      </dialog>

      <dialog id="cartDialog" className="cart-dialog">
        <article className="cart-content">
          <header className="detail-header">
            <h2>Your Cart</h2>
            <button id="cartCloseBtn" type="button" className="menu-btn">Close</button>
          </header>
          <div id="cartItems" className="cart-items"></div>
          <p id="cartEmpty" className="meta">Your cart is empty.</p>
          <p id="cartSubtotal" className="meta"></p>
          <div className="cart-actions">
            <button id="cartCheckoutBtn" type="button" className="buy-btn">Checkout</button>
          </div>
          <p id="cartStatus" className="meta"></p>
        </article>
      </dialog>

      <footer>
        <div id="about" className="footer-links">
          <a href="#">About</a>
          <a href="https://www.instagram.com" target="_blank" rel="noreferrer">Instagram</a>
        </div>
        <a className="email" href="mailto:ajimenezh29@yahoo.com">ajimenezh29@yahoo.com</a>

        <div className="legal-links">
          <a href="#">Imprint</a>
          <a href="#">Terms</a>
          <a href="#">Privacy</a>
        </div>

        <p className="meta">Shopping from United States.</p>
        <button className="currency" type="button">Change Currency</button>
        <p className="meta">&copy; YOUR NAME, <span id="year"></span></p>
      </footer>

      <ClientApp />
    </div>
  );
}
