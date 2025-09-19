📦 API Endpoints Documentation

Base URL: https://e-come-backend.onrender.com/v1

🔐 Authentication

➡️ GET /auth/google

Description: Trigger Google Signup

Response: 200 Ok

{
"status":""success",
"message": "Google signup successful",
"user":{id,email,firstName,lastName,role,token}
}

➡️ GET /auth/google

Description: Trigger Google Signin

Response: 200 Ok

{
"status":""success",
"message": "Google signup successful",
"user":{id,email,firstName,lastName,role,token}
}

➡️ POST /auth/register

Description: Register a new user

Request Body:

{
"firstName": "John",
"lastName":"Doe"
"email": "johndoe@example.com",
"password": "your_password"
}

Response: 201 Created

{
"status":""success",
"message": "User registered successfully. Check your email for verification.",
}

➡️ POST /auth/sign-in

Description: Log in with credentials

Request Body:

{
"email": "johndoe@example.com",
"password": "your_password"
}

Response: 200 OK

{
"status":"success",
"message": "sign-in successful",
"user": { \_id, firstName,firstName, email, role, isEmailVerified},
"token": "JWT_TOKEN"
}

➡️ POST /auth/change-password

Description: User to change their password

Request Body:

{
"currentPassword":"your_password",
"newPassword":"newPassword"
}

Response: 201 OK

{
"status":"success",
"message": "Password changed successfully"
}

➡️ POST /auth/forgot-password

Description: User to reset a new password

Request Body:

{
"email":"johndoe@example.com"
}

Response: 201 OK

{
"status":"success",
"message": "Reset link sent to your email. Please check your inbox."
}

➡️ POST /auth/reset-password

Description: Reset a new password after redirecting

Request Body:

{
"email":"johndoe@example.com",
"token":"JWT_Token",
"newPassword":"new_password"
}

Response: 201 OK

{
"status":"success",
"message":"Password has been reset successfully",
}

🛒 Products

➡️ POST /products/

Description: Create a new product (admin only)

Headers:

Authorization: Bearer <JWT_TOKEN> ADMIN TOKEN ONLY

Form Data (multipart/form-data):

name: string

description: string

price: number

stock: number

category: string (Category ID)

sizes: array of strings ["XS", ...]

images: array of image files (max 5)

colors: array of strings ["#ssdfsfsfs" ...]

Response: 201 Created

{
"status": "success",
"data": {
"\_id": "productId",
"name": "Shirt",
"description": "Cotton shirt",
"price": 30,
"images": [...],
"category": { ... },
"stock": 10,
"isActive:true,
"sizes": ["XS" ,"XL"...]
"createdAt": "...",
"updatedAt": "..."
}
}

➡️ GET /products

Description: Fetch all products

Response: 200 OK

{
"total": 15,
"page": 1,
"pages": 2,
"limit": 10,
"status": "success",
"data": [
{
"\_id": "683452b9ff6e0257d95174d0",
"name": "New Test Product2",
"description": "A nice product",
"colors": [
"red",
"blue"
],
"sizes": [
"XL",
"XS"
],
"price": 123,
"category": "68335c83c02fdcea12545e06",
"images": [
{
"url": "https://res.cloudinary.com/dqkum3eru/image/upload/v1748259513/products/rtt6kjgsjprhzhi0oilu.jpg",
"publicId": "products/rtt6kjgsjprhzhi0oilu",
"_id": "683452b9ff6e0257d95174d1"
},
{
"url": "https://res.cloudinary.com/dqkum3eru/image/upload/v1748259512/products/ifbp52cos2daippg4ovy.jpg",
"publicId": "products/ifbp52cos2daippg4ovy",
"_id": "683452b9ff6e0257d95174d2"
},
{
"url": "https://res.cloudinary.com/dqkum3eru/image/upload/v1748259513/products/ll30yx59xadinyrjyolm.jpg",
"publicId": "products/ll30yx59xadinyrjyolm",
"_id": "683452b9ff6e0257d95174d3"
}
],
"stock": 0,
"isActive": true,
"averageRating": 0,
"numReviews": 0,
"createdAt": "2025-05-26T11:38:33.035Z",
"updatedAt": "2025-05-26T11:38:33.035Z",
"\_\_v": 0
},
]
}

➡️ GET /products/productId

Description: Fetch single product

Response: 200 OK

{
"status": "success",
"data": {
"\_id": "683452b9ff6e0257d95174d0",
"name": "New Test Product2",
"description": "A nice product",
"colors": [
"red",
"blue"
],
"sizes": [
"XL",
"XS"
],
"price": 123,
"category": "68335c83c02fdcea12545e06",
"images": [
{
"url": "https://res.cloudinary.com/dqkum3eru/image/upload/v1748259513/products/rtt6kjgsjprhzhi0oilu.jpg",
"publicId": "products/rtt6kjgsjprhzhi0oilu",
"_id": "683452b9ff6e0257d95174d1"
},
{
"url": "https://res.cloudinary.com/dqkum3eru/image/upload/v1748259512/products/ifbp52cos2daippg4ovy.jpg",
"publicId": "products/ifbp52cos2daippg4ovy",
"_id": "683452b9ff6e0257d95174d2"
},
{
"url": "https://res.cloudinary.com/dqkum3eru/image/upload/v1748259513/products/ll30yx59xadinyrjyolm.jpg",
"publicId": "products/ll30yx59xadinyrjyolm",
"_id": "683452b9ff6e0257d95174d3"
}
],
"stock": 0,
"isActive": true,
"averageRating": 0,
"numReviews": 0,
"createdAt": "2025-05-26T11:38:33.035Z",
"updatedAt": "2025-05-26T11:38:33.035Z",
"\_\_v": 0
}
}

➡️ PATCH /products/productId

Description: Update a product

Headers:

Authorization: Bearer <JWT_TOKEN> ADMIN TOKEN ONLY

Form Data (multipart/form-data):

name: string (optional)

description: string (optional)

price: number (optional)

stock: number (optional)

category: string (Category ID) (optional)

sizes: array of strings ["XS", ...] (optional)

images: array of image files (max 5) (optional)you can add more if not more than 5

colors: array of strings ["#ssdfsfsfs" ...] (optional)

removeImageIds: array of string ["publicId", "publicId",...] (optional) pictures to remove

Response: 200 OK

{
"status": "success",
"message": "Product updated",
"data": {
"\_id": "683452b9ff6e0257d95174d0",
"name": "New Test Product2",
"description": "A nice product (UPDATED)",
"colors": [
"red",
"blue"
],
"sizes": [
"XL",
"XS"
],
"price": 123,
"category": "68335c83c02fdcea12545e06",
"images": [
{
"url": "https://res.cloudinary.com/dqkum3eru/image/upload/v1748259513/products/rtt6kjgsjprhzhi0oilu.jpg",
"publicId": "products/rtt6kjgsjprhzhi0oilu",
"_id": "683452b9ff6e0257d95174d1"
},
...
],
"stock": 0,
"isActive": true,
"averageRating": 0,
"numReviews": 0,
"createdAt": "2025-05-26T11:38:33.035Z",
"updatedAt": "2025-05-26T23:06:14.158Z",
"\_\_v": 0
}
}

➡️ DELETE /products/productId

Description: Delete single product

Headers:

Authorization: Bearer <JWT_TOKEN> ADMIN TOKEN ONLY

Response: 200 OK

{
"status": "success",
"message": "Product deleted successfully"
}

🛒 Cart

➡️ POST /cart/

Description: Add product to user's cart

Headers:

Authorization: Bearer <JWT_TOKEN>

Request Body:

{
"productId": "productId"
}

Response: 200 OK

{
"status": "success",
"message": "Item added to cart",
"data": {
"\_id": "6834cb306f3bcfee44826d7e",
"user": "6833293e29b457ee82505c26",
"items": [
{
"product": "682e79596418bd6a5ed71b1e",
"quantity": 2,
"_id": "6834f5c6da616b0fa646e296"
}
],
"createdAt": "2025-05-26T20:12:32.713Z",
"updatedAt": "2025-05-26T23:14:18.772Z",
"\_\_v": 2
}
}

➡️ GET /cart/

Description: Get products in cart

Headers:

Authorization: Bearer <JWT_TOKEN>

Response: 200 OK

{
"status": "success",
"message": "Cart retrieved successfully",
"data": [
{
"product": {
"colors": [],
"sizes": [],
"\_id": "682e79596418bd6a5ed71b1e",
"name": "Sports Water Bottle",
"description": "Leak-proof and BPA-free water bottle.",
"price": 12.49,
"brand": "HydroLife",
"images": [
{
"url": "https://via.placeholder.com/300x300.png?text=Water+Bottle",
"publicId": "water_bottle_001",
"_id": "682e79596418bd6a5ed71b1f"
}
],
"stock": 196,
"isActive": true,
"averageRating": 4.4,
"numReviews": 60,
"createdAt": "2025-05-22T01:09:45.792Z",
"updatedAt": "2025-05-22T16:28:38.666Z",
"\_\_v": 0
},
"quantity": 2,
"\_id": "6834f5c6da616b0fa646e296"
}
],
"totalItems": 1,
"page": 1,
"Pages": 1
}

➡️ DELETE /cart/productId

Description: Remove product from cart

Headers:

Authorization: Bearer <JWT_TOKEN>

Response: 200 OK

{
"status": "success",
"message": "Item removed from cart"
}

➡️ DELETE /cart/clear

Description: Remove all products from cart

Headers:

Authorization: Bearer <JWT_TOKEN>

Response: 200 OK

{
"status": "success",
"message": "Cart cleared"
}

📝Wishlist

➡️ POST /wishlist/

Description: Add product to user's wishlist

Headers:

Authorization: Bearer <JWT_TOKEN>

Request Body:

{
"productId": "productId"
}

Response: 200 OK

{
"status": "success",
"message": "Added to wishlist"
}

➡️ GET /wishlist/

Description: Get products from wishlist

Headers:

Authorization: Bearer <JWT_TOKEN>

Response: 200 OK

{
"status": "success",
"page": 1,
"limit": 10,
"total": 1,
"pages": 1,
"data": [
{
"_id": "682e79596418bd6a5ed71b1e",
"addedAt": "2025-05-26T23:28:10.926Z"
}
]
}

➡️ DELETE /wishlist/productId

Description: Remove product from wishlist

Headers:

Authorization: Bearer <JWT_TOKEN>

Response: 200 OK

{
"status": "success",
"message": "Removed from wishlist"
}

➡️ DELETE /cart/clear

Description: Remove all products from cart

Headers:

Authorization: Bearer <JWT_TOKEN>

Response: 200 OK

{
"status": "success",
"message": "Wishlist cleared"
}

📂 Categories

➡️ GET /categories/

Description: Retrieve all product categories ADMIN ONLY

Headers:

Authorization: Bearer <JWT_TOKEN>

Response: 200 OK

{
"status": "success",
"data": [
{
"_id": "68335c83c02fdcea12545e07",
"name": "Shorts",
"description": "Casual shorts",
"parentCategory": null,
"createdAt": "2025-05-25T18:08:03.875Z",
"updatedAt": "2025-05-25T18:08:03.875Z",
"__v": 0
},
.....
]
}

➡️ POST /categories

Description: Create a new category (admin only)

Headers:

Authorization: Bearer <JWT_TOKEN>

Request Body:

{
"name":"Shots",
"description":"Category for Shorts"
}

Response: 201 CREATED

{
"name": "Shots",
"description": "Category for Shorts",
"parentCategory": null,
"\_id": "6834fd27f5f4b570292e1165",
"createdAt": "2025-05-26T23:45:43.280Z",
"updatedAt": "2025-05-26T23:45:43.280Z",
"\_\_v": 0
}

➡️ GET /categories/categoryId

Description: Get a single categogy (admin only)

Headers:

Authorization: Bearer <JWT_TOKEN>

Response: 200 OK

{
"status": "success",
"data": {
"\_id": "68335c83c02fdcea12545e09",
"name": "Shirts",
"description": "Formal or casual shirts",
"parentCategory": null,
"createdAt": "2025-05-25T18:08:03.876Z",
"updatedAt": "2025-05-25T18:08:03.876Z",
"\_\_v": 0
}
}

➡️ PATCH/categories/

Description: update a category (admin only)

Headers:

Authorization: Bearer <JWT_TOKEN>

Request Body:

{
"name":"Shots",
"description":"Category for Shorts"
}

Response: 200 OK

{
"status": "success",
"data": {
"\_id": "68335c83c02fdcea12545e09",
"name": "Tee Shirts",
"description": "Formal or casual shirts",
"parentCategory": null,
"createdAt": "2025-05-25T18:08:03.876Z",
"updatedAt": "2025-05-26T23:53:41.545Z",
"\_\_v": 0
}
}

➡️ DELETE /categories/categoryId

Description: Remove a category

Headers:

Authorization: Bearer <JWT_TOKEN>

Response: 200 OK

{
"status": "success",
"message": "Category deleted successfully"
}

<!--

🧾 Orders

➡️ POST /orders

Description: Place an order

Headers:

Authorization: Bearer <JWT_TOKEN>

Request Body:

{
"items": [
{ "productId": "xyz", "quantity": 2 }
],
"shippingAddress": "123 Main St, City",
"paymentMethod": "card"
}

Response: 201 Created

{
"message": "Order placed successfully",
"order": { ... }
}

💬 Reviews

➡️ POST /reviews

Description: Add a review for a product

Headers:

Authorization: Bearer <JWT_TOKEN>

Request Body:

{
"productId": "productId",
"rating": 4,
"comment": "Very nice product"
} -->

// NEW PRODUCT FEILD

export type ProductVariant = {
id: string;
color: string;
colorHex?: string;
description: string;
sizes: string[];
images: string[];
stock: number;
};

// Product structure
export type ProductData = {
id: string;
name: string;
slug?: string;
description?: string;
date: string;
time: string;
createdAt?: Date;
updatedAt?: Date;
totalNumber: number;
category: string;
tags?: string[];
status: "out-of-stock" | "active" | "inactive" | "draft";
selectedSize?: string;
selectedColor?: string;
rating: number;
numReviews?: number;
stock: number;
isActive: boolean;
price: number;
comparePrice?: number;
variants: ProductVariant[];
seo?: {
title?: string;
description?: string;
keywords?: string[];
};
visibility?: "public" | "private" | "hidden";
sizes: string[];
mainImage: string;
images: {
\_id: string;
publicId: string;
url: string;
}[];
colors: string[];
};

Form Data (multipart/form-data):

name: string

description: string

price: number

totalNumber: number

category: string (Category ID)

tags: Array[String]

variants: Array[ { "color";"red", "colorHex":"#453234", "sizes":["XL","S"], "images":["imageName.jpg","imageName2.jpg"] "stock":20 }, { "color";"red", "colorHex":"#453234", "sizes":["XL","S"], "images":["imageName.jpg","imageName2.jpg"] "stock":20 } ]


export type OrdersData = {
  user: {
    userID:string,
    firstname:string,
    lastname:string,
  }
  totalPrice: number;
  paymentStatus: "completed" | "pending" | "cancelled";
  deliveryStatus: "completed" | "pending" | "cancelled" | "shpped";
  fulfilledStatus:"unfulfilled" | "fulfilled",
  items: {
    numOfItems: number;
    products: [{ product ID:string, quantity:number }]
  };
  discountCode: string;
  shippingAddress:{
    address:string,
    town:string,
    region:string,
    landmark:string
  }
};