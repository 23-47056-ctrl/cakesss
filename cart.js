// Cart functionality
class Cart {
    constructor() {
        this.items = this.loadCart();
        this.init();
    }

    init() {
        this.renderCart();
        this.attachEventListeners();
        this.updateCartCount();
    }

    loadCart() {
        const savedCart = localStorage.getItem('luxuryCakesCart');
        return savedCart ? JSON.parse(savedCart) : [];
    }

    saveCart() {
        localStorage.setItem('luxuryCakesCart', JSON.stringify(this.items));
    }

    addItem(product, quantity = 1) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                ...product,
                quantity: quantity
            });
        }
        
        this.saveCart();
        this.renderCart();
        this.updateCartCount();
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.renderCart();
        this.updateCartCount();
    }

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = quantity;
                this.saveCart();
                this.renderCart();
            }
        }
    }

    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    getSubtotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    calculateShipping() {
        return this.items.length > 0 ? 5.00 : 0;
    }

    calculateTax() {
        return this.getSubtotal() * 0.075; // 7.5% tax
    }

    getTotal() {
        return this.getSubtotal() + this.calculateShipping() + this.calculateTax();
    }

    clearCart() {
        this.items = [];
        this.saveCart();
        this.renderCart();
        this.updateCartCount();
    }

    updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            cartCount.textContent = this.getTotalItems();
        }
    }

    renderCart() {
        const cartItemsList = document.getElementById('cartItemsList');
        const cartItemsCount = document.getElementById('cartItemsCount');
        const subtotal = document.getElementById('subtotal');
        const shipping = document.getElementById('shipping');
        const tax = document.getElementById('tax');
        const total = document.getElementById('total');
        const checkoutBtn = document.getElementById('checkoutBtn');

        if (this.items.length === 0) {
            cartItemsList.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <h2>Your cart is empty</h2>
                    <p>Add some delicious cakes and beverages to get started!</p>
                    <a href="menu.html" class="btn btn-primary">Browse Menu</a>
                </div>
            `;
            cartItemsCount.textContent = '0';
            subtotal.textContent = '$0.00';
            shipping.textContent = '$0.00';
            tax.textContent = '$0.00';
            total.textContent = '$0.00';
            checkoutBtn.disabled = true;
            return;
        }

        cartItemsCount.textContent = this.getTotalItems();
        cartItemsList.innerHTML = this.items.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="item-image">
                    <i class="fas fa-${item.type === 'cake' ? 'birthday-cake' : 'glass'} fa-2x"></i>
                </div>
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                </div>
                <div class="item-price">$${item.price.toFixed(2)}</div>
                <div class="quantity-controls">
                    <button class="quantity-btn decrease" data-id="${item.id}">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn increase" data-id="${item.id}">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <button class="remove-btn" data-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        // Update totals
        subtotal.textContent = `$${this.getSubtotal().toFixed(2)}`;
        shipping.textContent = `$${this.calculateShipping().toFixed(2)}`;
        tax.textContent = `$${this.calculateTax().toFixed(2)}`;
        total.textContent = `$${this.getTotal().toFixed(2)}`;
        checkoutBtn.disabled = false;
    }

    attachEventListeners() {
        document.addEventListener('click', (e) => {
            // Quantity decrease
            if (e.target.closest('.decrease')) {
                const productId = parseInt(e.target.closest('.decrease').dataset.id);
                const item = this.items.find(item => item.id === productId);
                if (item && item.quantity > 1) {
                    this.updateQuantity(productId, item.quantity - 1);
                }
            }

            // Quantity increase
            if (e.target.closest('.increase')) {
                const productId = parseInt(e.target.closest('.increase').dataset.id);
                const item = this.items.find(item => item.id === productId);
                if (item) {
                    this.updateQuantity(productId, item.quantity + 1);
                }
            }

            // Remove item
            if (e.target.closest('.remove-btn')) {
                const productId = parseInt(e.target.closest('.remove-btn').dataset.id);
                this.removeItem(productId);
            }
        });

        // Checkout button
        document.getElementById('checkoutBtn').addEventListener('click', () => {
            this.handleCheckout();
        });
    }

    handleCheckout() {
        if (this.items.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        // Simulate checkout process
        const checkoutModal = this.createCheckoutModal();
        document.body.appendChild(checkoutModal);
        checkoutModal.style.display = 'flex';

        // Close modal when clicking outside
        checkoutModal.addEventListener('click', (e) => {
            if (e.target === checkoutModal) {
                checkoutModal.remove();
            }
        });
    }

    createCheckoutModal() {
        const modal = document.createElement('div');
        modal.className = 'checkout-modal';
        modal.innerHTML = `
            <div class="checkout-modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-check-circle"></i> Order Confirmed!</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Thank you for your order! Your delicious treats are being prepared.</p>
                    <div class="order-details">
                        <h4>Order Summary</h4>
                        <p><strong>Total:</strong> $${this.getTotal().toFixed(2)}</p>
                        <p><strong>Items:</strong> ${this.getTotalItems()}</p>
                        <p><strong>Estimated Delivery:</strong> 30-45 minutes</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" id="continueShopping">Continue Shopping</button>
                </div>
            </div>
        `;

        // Add styles for the modal
        const styles = `
            <style>
                .checkout-modal {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    z-index: 2000;
                    align-items: center;
                    justify-content: center;
                }
                .checkout-modal-content {
                    background: var(--dark-gray);
                    border-radius: var(--radius-lg);
                    width: 90%;
                    max-width: 500px;
                    border: 1px solid rgba(139, 0, 0, 0.3);
                }
                .modal-header {
                    background: var(--black);
                    padding: 20px 25px;
                    border-bottom: 1px solid var(--light-gray);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .modal-header h3 {
                    color: var(--gold);
                    margin: 0;
                    font-family: var(--font-main);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .close-modal {
                    background: none;
                    border: none;
                    color: var(--white);
                    font-size: 1.5rem;
                    cursor: pointer;
                }
                .modal-body {
                    padding: 25px;
                }
                .order-details {
                    margin-top: 20px;
                    padding: 15px;
                    background: var(--medium-gray);
                    border-radius: var(--radius-md);
                }
                .order-details h4 {
                    color: var(--gold);
                    margin-bottom: 10px;
                }
                .modal-footer {
                    padding: 20px 25px;
                    border-top: 1px solid var(--light-gray);
                    text-align: center;
                }
            </style>
        `;
        document.head.insertAdjacentHTML('beforeend', styles);

        // Close modal and clear cart
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
            this.clearCart();
        });

        modal.querySelector('#continueShopping').addEventListener('click', () => {
            modal.remove();
            this.clearCart();
            window.location.href = 'menu.html';
        });

        return modal;
    }
}

// Initialize cart when page loads
document.addEventListener('DOMContentLoaded', () => {
    const cart = new Cart();
    
    // Make cart globally available
    window.cart = cart;
});