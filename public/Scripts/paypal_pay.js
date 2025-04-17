import config from "./config.js"

const API_URL = config.API_URL

async function fetchAndUpdateBalance() {
    try {
        const response = await fetch(`${API_URL}/api/auth/balance`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
            },
        });

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

document.addEventListener("DOMContentLoaded", async () => {
    const paypalOption = document.getElementById("paypal-option");
    const creditOption = document.getElementById("credits-option");
    const paypalButtonContainer = document.getElementById("paypal-button-container");
    const creditCheckoutButton = document.getElementById("credit-checkout-button");

    const togglePaypalButton = () => {
        paypalButtonContainer.style.display = paypalOption.checked ? "block" : "none";
        creditCheckoutButton.style.display = creditOption.checked ? "block" : "none";
    };

    paypalOption.addEventListener("change", togglePaypalButton);
    creditOption.addEventListener("change", togglePaypalButton);

    togglePaypalButton();

    const remainingCreditsElement = document.getElementById("remaining-credits");
    const totalCreditsElement = document.querySelector(".list-group-item strong");

    let balance = await fetchAndUpdateBalance();

    const checkCredits = () => {
        const requiredCredits = parseInt(totalCreditsElement.textContent.split(" ")[0], 10);

        if (balance >= requiredCredits) {
            remainingCreditsElement.style.color = "inherit";
            creditCheckoutButton.disabled = false;
        } else {
            remainingCreditsElement.style.color = "red";
            creditCheckoutButton.disabled = true;
        }
    };

    checkCredits();

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
            amount: 100,
        },

        async createOrder() {
            try {
                const response = await fetch(`${API_URL}/api/payment/orders`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    // use the "body" param to optionally pass additional order information
                    // like product ids and quantities
                    body: JSON.stringify({
                        cart: [
                            {
                                id: "YOUR_PRODUCT_ID",
                                quantity: "YOUR_PRODUCT_QUANTITY",
                            },
                        ],
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
                // resultMessage(`Could not initiate PayPal Checkout...<br><br>${error}`);
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
                        `Transaction ${transaction.status}: ${transaction.id}<br>
          <br>See console for all available details`
                    );
                    console.log(
                        "Capture result",
                        orderData,
                        JSON.stringify(orderData, null, 2)
                    );
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
