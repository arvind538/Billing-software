// Billing page aur Navbar ke beech "abhi kaunsa customer select hai"
// ye data share karne ke liye chhota helper.

const STORAGE_KEY = "activeCustomer";
const EVENT_NAME = "billing:active-customer-changed";

export function setActiveCustomer(customer) {
    if (typeof window === "undefined") return;

    if (customer && customer._id) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(customer));
    } else {
        sessionStorage.removeItem(STORAGE_KEY);
    }

    // sessionStorage khud same-tab listeners ko trigger nahi karta,
    // isliye custom event khud dispatch kar rahe hain
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function getActiveCustomer() {
    if (typeof window === "undefined") return null;

    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function subscribeActiveCustomer(callback) {
    if (typeof window === "undefined") return () => { };

    const handler = () => callback(getActiveCustomer());

    window.addEventListener(EVENT_NAME, handler);

    return () => {
        window.removeEventListener(EVENT_NAME, handler);
    };
}