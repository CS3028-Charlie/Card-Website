import config from "./config.js"

const API_URL = config.API_URL

function getBasket() {
    try {
        const basket = JSON.parse(localStorage.getItem('basket'));
        return Array.isArray(basket) ? basket : [];
    } catch {
        return [];
    }
}

function renderCart() {
    const cartList = document.getElementById('cart-list');
    const cartCount = document.getElementById('cart-count');
    cartList.innerHTML = '';
    const basket = getBasket();
    let totalPrice = 0;
    let totalCredits = 0;

    basket.forEach((item, idx) => {
        totalPrice += Number(item.price);
        totalCredits += Math.round(item.price) * 100; // £0.99 = 100 credits
        const li = document.createElement('li');
        li.className = "list-group-item d-flex justify-content-between lh-condensed";
        li.innerHTML = `
            <div>
                <h6 class="my-0">${item.cardType || 'Card'}</h6>
                <small class="text-muted">Images: ${item.images ? item.images.length : 0}</small>
            </div>
            <span class="text-muted">${Math.round(item.price) * 100} credits</span>
        `;
        cartList.appendChild(li);
    });

    // formatting
    totalPrice = Number(totalPrice.toFixed(2));
    totalCredits = Number(String(totalCredits));

    // Add total row
    const totalLi = document.createElement('li');
    totalLi.className = "list-group-item d-flex justify-content-between";
    totalLi.innerHTML = `
        <span>Total</span>
        <strong id="cart-total">${totalCredits} credits (£${totalPrice})</strong>
    `;
    cartList.appendChild(totalLi);

    cartCount.textContent = basket.length;
    return {
        totalCredits,
        totalPrice,
    };
}

async function fetchAndUpdateBalance() {
    try {
        const response = await fetch(`${API_URL}/api/auth/balance`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
            },
        });

        if (response.status  === 401) {
            // user is not logged in, redirect to login page
            window.alert("Session expired, please log in again.");
            window.location.href = "/";
        }

        if (!response.ok) {
            throw new Error("Failed to fetch balance");
        }

        const data = await response.json();
        document.getElementById("remaining-credits").textContent = data.balance;
        return data.balance;

    } catch (error) {
        console.error("Error fetching balance:", error);
    }

    return 0;
}

function resultMessage(message) {
    // use bootstrap modal for result message
    const modalBody = document.getElementById("result-modal-body");
    if (modalBody) {
        modalBody.innerHTML = message;
        $('#resultModal').modal({backdrop: 'static', keyboard: false});
        const btn = document.getElementById("return-home-btn-modal");
        if (btn) {
            btn.onclick = () => window.location.href = "/";
        }
    } else {
        alert(message); // fallback if modal not found
    }
}

function getTransactionDetails() {
    return {
        amount: renderCart().totalPrice.toFixed(2), // get total from basket
        currency: "GBP",
        items: getBasket().map(item => ({
            cardType: item.cardType,
            price: item.price,
            images: item.images
        })),
    };
}

async function checkoutWithCredits() {
    try {
        const credits = renderCart().totalCredits; // get total from basket
        const response = await fetch(`${API_URL}/api/auth/deduct`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
            },
            body: JSON.stringify({ amount: credits }),
        });

        if (response.ok) {
            resultMessage(`Thank you for your purchase!<br><br>${credits} credits have been deducted from your account.<br><br>`);
            localStorage.setItem('basket', JSON.stringify([])); // empty basket
            renderCart();
        } else {
            const errorData = await response.json();
            resultMessage(`Sorry, your transaction could not be processed...<br><br>${errorData.message}`);
        }
    } catch (error) {
        console.error("Error fetching balance:", error);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const paypalOption = document.getElementById("paypal-option");
    const creditOption = document.getElementById("credits-option");
    const paypalButtonContainer = document.getElementById("paypal-button-container");
    const creditCheckoutButton = document.getElementById("credit-checkout-button");

    // toggle the visibility of the buttons based on the selected option
    const togglePaypalButton = () => {
        paypalButtonContainer.style.display = paypalOption.checked ? "block" : "none";
        creditCheckoutButton.style.display = creditOption.checked ? "block" : "none";
    };

    paypalOption.addEventListener("change", togglePaypalButton);
    creditOption.addEventListener("change", togglePaypalButton);

    togglePaypalButton();

    const remainingCreditsElement = document.getElementById("remaining-credits");

    let balance = await fetchAndUpdateBalance();

    renderCart();

    // update balance on page load
    const updateCredits = () => {
        const totalCreditsElement = document.getElementById("cart-total");
        const requiredCredits = totalCreditsElement
            ? parseInt(totalCreditsElement.textContent.split(" ")[0], 10)
            : 0;

        if (balance >= requiredCredits) {
            remainingCreditsElement.style.color = "inherit";
            creditCheckoutButton.disabled = false;
        } else {
            remainingCreditsElement.style.color = "red";
            creditCheckoutButton.disabled = true;
        }
    };
    updateCredits();

    // add event listener for credit checkout button
    creditCheckoutButton.addEventListener("click", async function(event) {
        event.preventDefault();
        await checkoutWithCredits();
        await fetchAndUpdateBalance(); // update balance after checkout
    });

});

window.paypal
    .Buttons({
        style: {
            shape: "rect",
            layout: "vertical",
            color: "gold",
            label: "paypal",
        },
        message: {
            amount: getTransactionDetails().amount,
        },

        async createOrder() {
            try {
                const response = await fetch(`${API_URL}/api/payment/orders`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        cart: getTransactionDetails()
                    }),
                });

                const orderData = await response.json();

                if (orderData.id) {
                    return orderData.id;
                }
                const errorDetail = orderData?.details?.[0];
                const errorMessage = errorDetail
                    ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
                    : JSON.stringify(orderData);

                throw new Error(errorMessage);
            } catch (error) {
                console.error(error);
                resultMessage(`Could not initiate PayPal Checkout...<br><br>${error}`);
            }
        },

        async onApprove(data, actions) {
            try {
                const response = await fetch(
                    `${API_URL}/api/payment/orders/${data.orderID}/capture`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );

                const orderData = await response.json();
                // Three cases to handle:
                //   (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
                //   (2) Other non-recoverable errors -> Show a failure message
                //   (3) Successful transaction -> Show confirmation or thank you message

                const errorDetail = orderData?.details?.[0];

                if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
                    // (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
                    // recoverable state, per
                    // https://developer.paypal.com/docs/checkout/standard/customize/handle-funding-failures/
                    return actions.restart();
                } else if (errorDetail) {
                    // (2) Other non-recoverable errors -> Show a failure message
                    throw new Error(
                        `${errorDetail.description} (${orderData.debug_id})`
                    );
                } else if (!orderData.purchase_units) {
                    throw new Error(JSON.stringify(orderData));
                } else {
                    // (3) Successful transaction -> Show confirmation or thank you message
                    // Or go to another URL:  actions.redirect('thank_you.html');
                    const transaction =
                        orderData?.purchase_units?.[0]?.payments
                            ?.captures?.[0] ||
                        orderData?.purchase_units?.[0]?.payments
                            ?.authorizations?.[0];
                    resultMessage(
                        `Thank you for your purchase!<br><br>
                        Transaction ID: ${transaction.id}<br><br>`
                    );
                    console.log(
                        "Capture result",
                        orderData,
                        JSON.stringify(orderData, null, 2)
                    );

                    localStorage.setItem('basket', JSON.stringify([])); // empty basket
                    renderCart();
                }
            } catch (error) {
                console.error(error);
                resultMessage(
                    `Sorry, your transaction could not be processed...<br><br>${error}`
                );
            }
        },
    })
    .render("#paypal-button-container");
