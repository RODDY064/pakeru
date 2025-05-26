📦 API Endpoints Documentation

Base URL: https://e-come-backend.onrender.com/api/v1

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

➡️ POST /auth/login

Description: Log in with credentials

Request Body:

{
"email": "johndoe@example.com",
"password": "your_password"
}

Response: 200 OK

{
"status":"success",
"message": "Login successful",
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

<!--
🛒 Products

➡️ POST /products

Description: Create a new product (admin only)

Headers:

Authorization: Bearer <JWT_TOKEN>

Form Data (multipart/form-data):

name: string

description: string

price: number

category: string (Category ID)

images: array of image files (max 5)

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
"createdAt": "...",
"updatedAt": "..."
}
}

➡️ GET /products

Description: Fetch all products

Response: 200 OK

[
{
"_id": "productId",
"name": "Shirt",
"description": "Cotton shirt",
...
}
]

📂 Categories

➡️ GET /categories

Description: Retrieve all product categories

➡️ POST /categories

Description: Create a new category (admin only)

Request Body:

{
"name": "Trousers",
"description": "Optional description"
}

🛒 Cart

➡️ POST /cart

Description: Add a product to user's cart

Headers:

Authorization: Bearer <JWT_TOKEN>

Request Body:

{
"productId": "productId",
"quantity": 2
}

Response: 200 OK

{
"message": "Item added to cart",
"cart": { ... }
}

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
