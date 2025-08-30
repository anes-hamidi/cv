# **App Name**: OfflinePOS

## Core Features:

- Product Catalog: Manage a list of products with details such as name, price, and optional image, and keep the product list available locally for offline use.
- Offline Transaction Recording: Record sales transactions while offline, storing them locally until a network connection is available. Store item name and total cost in local storage
- QR Code Scanner Integration: Integrate a QR code scanner to quickly add items to the current sale.
- Bluetooth Thermal Printer Connection: Connect to a bluetooth thermal printer to print receipts.
- Sales Summary: Provide a summary of completed sales, locally calculated without accessing a server.
- Intelligent Recommendation Tool: Provide a suggestion for a relevant product to add to the sale, based on the current item(s) in the sale and past purchase data, making a single call to an LLM API using local sales data.  If an item is deemed appropriate, a suggestion will be generated.

## Style Guidelines:

- Primary color: Soft coral (#F08080) to evoke a sense of warmth and approachability.
- Background color: Light gray (#F0F0F0) provides a clean and neutral backdrop.
- Accent color: Teal (#008080) is used to highlight interactive elements and important information, contrasting with the coral to draw attention.
- Font: 'PT Sans' (sans-serif) for clarity and readability in both the interface and printed receipts.
- Use simple, outlined icons to represent products and actions, ensuring clarity and ease of use.
- The layout should be clean and intuitive, prioritizing ease of use on both web and Android platforms. Use a grid system for consistency.
- Subtle transitions and animations can be used to provide feedback on actions and guide the user through the app, such as highlighting when an item is added to a sale.