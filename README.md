# Adplace

A static, GitHub Pages-ready website for selling physical advertising positions on two MacBooks.

## What is included

- Two studio-cleaned, horizontally aligned MacBook photos
- Nine selectable sections on the Midnight MacBook and ten on the Sky Blue MacBook
- Numbered circles inside every advertising section
- Live price and placement preview
- Client-side logo upload preview
- Booking details and payment summary
- Booking email generator
- Responsive design for phone and desktop

## Personalise before launch

Open `script.js` and update the `CONFIG` block at the top:

```js
const CONFIG = {
  bookingEmail: "you@example.com",
  upiId: "yourname@upi",
  qrImage: "assets/payment-qr.jpeg"
};
```

Then add your payment QR image at `assets/payment-qr.jpeg`. The current offer is $50 per position for 50 days ($1/day). Prices are also in `script.js`, inside each laptop's `positions` list.

## Publish with GitHub Pages

In the GitHub repository, open **Settings → Pages**, choose **Deploy from a branch**, select the branch containing these files and the root folder, then save.

## Important

This is a static website. It prepares a booking email but does not automatically collect payments, upload files, reserve inventory, or send confirmation emails. Those features require a backend or a form/payment service.
